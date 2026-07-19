export const SECURITY_CONFIG = {
    password: {
        minLength: 8,
        maxLength: 128,

        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecialCharacter: true,

        blockedPasswords: [
            "password",
            "password123",
            "12345678",
            "123456789",
            "qwerty",
            "admin",
            "welcome",
            "letmein",
            "atlasbank123",
        ],
    },
};