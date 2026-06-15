declare module "bcryptjs" {
  const bcrypt: {
    hashSync(password: string, rounds: number): string;
    hash(password: string, rounds: number): Promise<string>;
    compare(password: string, hash: string): Promise<boolean>;
  };
  export default bcrypt;
}
