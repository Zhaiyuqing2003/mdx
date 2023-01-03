export const panic = (message: string): never => {
    throw new Error(message);
};