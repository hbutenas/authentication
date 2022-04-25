const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const CustomError = require("../../errors");
const {hashPassword, validatePassword} = require("../../utils/bcrypt/bcrypt.utils");
const {assignCookiesToResponse, deleteCookiesFromResponse} = require("../../utils/jwt/jwt.utils");

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

module.exports = {registerService, loginService, logoutService};