import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      estabelecimentoId: string;
    } & DefaultSession["user"];
  }

  interface User {
    estabelecimentoId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    estabelecimentoId?: string;
  }
}

