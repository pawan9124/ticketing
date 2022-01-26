import { scrypt, randomBytes} from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Password {
    //static keyword provides the function the functionality to directly be used by the Password class
    static async toHash(password: string) {
        const salt = randomBytes(8).toString('hex');
        //the scryptAsync is returning buffer so converting the return as Buffer for the buf variable
        const buf = (await scryptAsync(password, salt, 64)) as Buffer;

        return `${buf.toString('hex')}.${salt}`;
    }

    static async compare(storedPassword:string, suppliedPassword: string){

        const [hashedPassword, salt] = storedPassword.split(".");
        const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

        return buf.toString('hex') === hashedPassword;

    }
}