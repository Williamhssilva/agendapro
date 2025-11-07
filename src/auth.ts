import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { AdapterUser } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email as string },
          include: { estabelecimento: true },
        });

        if (!usuario || !usuario.senha) {
          return null;
        }

        const senhaCorreta = await bcrypt.compare(
          credentials.password as string,
          usuario.senha
        );

        if (!senhaCorreta) {
          return null;
        }

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nome,
          estabelecimentoId: usuario.estabelecimentoId,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && "estabelecimentoId" in user) {
        const usuario = user as AdapterUser & { estabelecimentoId?: string };
        if (typeof usuario.estabelecimentoId === "string") {
          (token as JWT & { estabelecimentoId?: string }).estabelecimentoId = usuario.estabelecimentoId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as typeof session.user & {
          id?: string;
          estabelecimentoId?: string;
        };

        if (typeof token.sub === "string") {
          sessionUser.id = token.sub;
        }

        const tokenWithEstabelecimento = token as JWT & { estabelecimentoId?: unknown };
        if (typeof tokenWithEstabelecimento.estabelecimentoId === "string") {
          sessionUser.estabelecimentoId = tokenWithEstabelecimento.estabelecimentoId;
        }
      }
      return session;
    },
  },
});

