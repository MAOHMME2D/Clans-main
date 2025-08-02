declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN?: string;
            MONGO_URL?: string;
            enviroment: 'dev' | 'prod' | 'debug';
        }
    }
}

export {};
