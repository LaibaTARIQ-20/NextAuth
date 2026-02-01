"use server";

import { sessionOptions, SessionData, defaultSession } from "@/lib";
import { getIronSession } from "iron-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// MOCK DATABASE 
const MOCK_USERS = [
  { 
    id: "1", 
    username: "john", 
    password: "password123", 
    isPro: true, 
    isBlocked: false 
  },
  { 
    id: "2", 
    username: "jane", 
    password: "password123", 
    isPro: false, 
    isBlocked: false 
  },
];

export const getSession = async () => {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }


  return session;
};

export const login = async (
  prevState: { error?: string } | undefined,
  formData: FormData
) => {
  const session = await getSession();

  const formUsername = formData.get("username") as string;
  const formPassword = formData.get("password") as string;

  
  const user = MOCK_USERS.find(
    u => u.username === formUsername && u.password === formPassword
  );

  if (!user) {
    return { error: "Wrong Credentials!" };
  }

  session.userId = user.id;
  session.username = user.username;
  session.isPro = user.isPro;
  session.isLoggedIn = true;

  await session.save();
  redirect("/");
};

export const logout = async () => {
  const session = await getSession();
  session.destroy();
  redirect("/");
};

export const changePremium = async () => {
  const session = await getSession();

 

  const user = MOCK_USERS.find(u => u.id === session.userId);
  if (user) {
    user.isPro = !user.isPro;
    session.isPro = user.isPro;
  }

  await session.save();
  revalidatePath("/profile");
};

export const changeUsername = async (formData: FormData) => {
  const session = await getSession();
  const newUsername = formData.get("username") as string;


  const user = MOCK_USERS.find(u => u.id === session.userId);
  if (user) {
    user.username = newUsername;
    session.username = newUsername;
  }

  await session.save();
  revalidatePath("/profile");
};