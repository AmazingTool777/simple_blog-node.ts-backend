import jwt from "jsonwebtoken";

// JWT signer
const jwtSign = (payload: Object, secretKey: string = "SecretKey", expiresIn: number) => {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(payload, secretKey, { expiresIn }, (error, hash) => {
            if (error) reject(error);
            else if (hash) resolve(hash);
        });
    })
}

// JWT verifier
const jwtVerify = (hash: string, secretKey: string = 'SecretKey') => {
    return new Promise((resolve, reject) => {
        jwt.verify(hash, secretKey, (error, payload) => {
            if (error) reject(error);
            else if (payload) resolve(payload);
        });
    });
}

export { jwtSign, jwtVerify };