const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const CustomError = require("../../errors");
const {hashPassword, validatePassword} = require("../../utils/bcrypt/bcrypt.utils");
const {assignCookiesToResponse, deleteCookiesFromResponse} = require("../../utils/jwt/jwt.utils");
const {sendEmail} = require("../../utils/nodemailer/nodemailer.utils");
const crypto = require("crypto");
const registerService = async (requestBody) => {
    const {email, username, password, firstName, lastName} = requestBody;

    // check for existing user
    const existingUser = await prisma.user.findFirst({where: {email}});

    // user already exists
    if (existingUser) throw new CustomError.BadRequest("Email address is already taken");

    try {
        // create password hash
        const hashedPassword = await hashPassword(password);

        return await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                username: username.toLowerCase(),
                password: hashedPassword,
                firstName: firstName && firstName,
                lastName: lastName && lastName
            },
            select: {
                email: true,
                username: true,
                firstName: true,
                lastName: true
            }
        });
    } catch (e) {
        console.error("Error occurred on registration. Handle incoming error request by e.code");
        if (e) throw new CustomError.InternalServer("Something went wrong... Please try again later");
    }
};

const loginService = async (Request, Response) => {
    const {email, password} = Request.body;

    // check for existing user
    const existingUser = await prisma.user.findFirst({
        where: {
            email: email.toLowerCase()
        },
    });

    if (!existingUser) throw new CustomError.BadRequest("Invalid email address or password");

    // compare password
    const passwordMatching = await validatePassword(password, existingUser.password);

    if (!passwordMatching) throw new CustomError.BadRequest("Invalid email address or password");

    // create user payload
    const payload = {
        user_id: existingUser.id,
        username: existingUser.username,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName
    };

    // create tokens and assign cookies
    await assignCookiesToResponse(payload, Response);

    return {message: "Successfully signed in", payload};
};

const logoutService = async (Response) => {
    await deleteCookiesFromResponse(Response);

    return {message: "User successfully logged out"};
};

const forgotPasswordService = async (Request) => {
    const {password, email: bodyEmail} = Request.body;
    const {authKey, email: queryEmail} = Request.query;

    // check for existing user
    const userExists = await prisma.user.findFirst({
        where: {
            email: bodyEmail,
        }
    });

    // email exists
    if (userExists) {

        // user opened the url from email, but didn't typed the password value
        if (authKey && queryEmail && !password || authKey && queryEmail && password.trim() === "") {
            throw new CustomError.BadRequest("Password is required");
        }

        // user opened the url from email, passed all values
        if (authKey && queryEmail && password) {
            // find the request author by authKey and email
            const existingPasswordRequest = await prisma.Reset_Password.findFirst({
                where: {
                    authKey,
                    userEmail: queryEmail.toLowerCase()
                }
            });

            if (existingPasswordRequest) {
                return await resetPasswordHelper(existingPasswordRequest, password);
            } else {
                return {message: "Password reset has expired, please request one more time"};
            }

        }

        // user only passed his email
        // generate authKey
        const authenticationKey = crypto.randomBytes(10).toString("hex");

        // save request to DB
        const resetPasswordUser = await prisma.Reset_Password.create({
            data: {
                userEmail: bodyEmail.toLowerCase(),
                authKey: authenticationKey,
                expiresAt: new Date(+new Date() + 60000 * 10)
            },
        });

        if (resetPasswordUser) {
            // call email services
            await sendEmail(authenticationKey, bodyEmail.toLowerCase());
            return {message: "If email exists instructions how to reset password will be sent to the email and will be valid for 10 minutes"};
        } else {
            throw new CustomError.BadRequest("Something went wrong... Please try again later");
        }

    } else {
        return {message: "If email exists instructions how to reset password will be sent to the email and will be valid for 10 minutes"};
    }
};

const resetPasswordHelper = async (existingPasswordRequest, password) => {
        // is the request still valid? check expiry date
        const isResetValid = await compareExpirationTime(existingPasswordRequest);

        // request is valid - reset password
        if (isResetValid) {
            const hashedPassword = await hashPassword(password);

            // update users password
            const updatedUser = await prisma.user.update({
                where: {
                    email: existingPasswordRequest.userEmail
                },
                data: {
                    password: hashedPassword,
                }
            });

            // if successfully updated - remove the records related to this user
            if (updatedUser) {
                const deletedUserRecords = await prisma.Reset_Password.deleteMany({
                    where: {
                        userEmail: existingPasswordRequest.userEmail
                    }
                });

                if (deletedUserRecords.count > 0) {
                    return {message: "Password successfully updated"};
                }
            } else throw new CustomError.BadRequest("Something went wrong... Please try again later");
        }
    }
;

const compareExpirationTime = async (expirationTime) => {
    // get expiry date
    const expiresAt = expirationTime.expiresAt.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    // current time
    const currentTime = new Date().toLocaleTimeString("it-It", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    // is the request still valid?
    // TODO - What if the request comes the next day but earlier than the currentTime? Might be the issue.
    if (currentTime > expiresAt) throw new CustomError.BadRequest("Password reset expired. Please request one more time");

    return true;
};

module.exports = {registerService, loginService, logoutService, forgotPasswordService};