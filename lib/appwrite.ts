import { CreateUserParams, SignInParams, User } from "@/type";
import {
  Account,
  Avatars,
  Client,
  ID,
  Permission,
  Query,
  Role,
  TablesDB,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  platform: "com.picupiee.javery",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: "68e235ca00020d98e7c0",
  userCollectionId: "68e237490015e276f322",
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const database = new TablesDB(client);

const avatar = new Avatars(client);

export const createUser = async ({
  email,
  password,
  name,
}: CreateUserParams) => {
  try {
    const newAccount = await account.create({
      userId: ID.unique(),
      email: email,
      password: password,
      name: name,
    });
    if (!newAccount) throw Error;

    await signIn({ email, password });

    const avatarUrl = avatar.getInitialsURL(name);

    const newUser = await database.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userCollectionId,
      rowId: ID.unique(),
      data: {
        accountId: newAccount.$id,
        email,
        name,
        avatar: avatarUrl,
      },
      permissions: [
        Permission.read(Role.user(newAccount.$id)),
        Permission.write(Role.user(newAccount.$id)),
      ],
    });
    console.log("New User: ", newUser.$id);
    return newUser;
  } catch (e) {
    throw new Error(e as string);
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    const session = await account.createEmailPasswordSession({
      email: email,
      password: password,
    });
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) return null;

    const currentUser = await database.listRows<User>({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userCollectionId,
      queries: [Query.equal("accountId", currentAccount.$id)],
    });

    if (currentUser.rows.length === 0) throw new Error("User row is not found");

    // if (!currentUser) throw Error;

    return currentUser.rows[0];
  } catch (e) {
    const errorMessage = (e as any).message || String(e);
    if (
      errorMessage.includes('missing scopes (["account"])') ||
      errorMessage.includes("User (role: guest)")
    ) {
      console.log("No active session found (expected for guest users)");
      return null;
    }
    console.error("Unexpected error during session check : ", e);
    throw e;
  }
};

export const signOut = async () => {
  try {
    // Deletes the active session from the server
    await account.deleteSession({sessionId: 'current'});
  } catch (e) {
    console.error("Appwrite Sign Out Error:", e);
    // It's generally safer to ignore errors here and proceed
    // to clear local state, as the session might already be expired.
  }
};
