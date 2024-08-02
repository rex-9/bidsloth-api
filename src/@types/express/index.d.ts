import { ICreator } from "@/models/creator.model";

declare global {
    namespace Express {
        export interface Request {
            $currentUser?: ICreator;
        }
    }
}

declare module "*.png" {
    const value: string;
    export default value;
}
