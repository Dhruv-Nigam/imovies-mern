import mongoose from "mongoose";

// Automatically sanitizes and URL-encodes special characters in passwords (e.g. '@' in password)
export const sanitizeMongoUri = (rawUri) => {
  if (!rawUri || typeof rawUri !== "string" || !rawUri.startsWith("mongodb")) {
    return rawUri;
  }
  try {
    const protoIndex = rawUri.indexOf("://");
    if (protoIndex === -1) return rawUri;
    const protocol = rawUri.slice(0, protoIndex);
    const afterProto = rawUri.slice(protoIndex + 3);

    const firstSlash = afterProto.indexOf("/");
    const authAndHost = firstSlash !== -1 ? afterProto.slice(0, firstSlash) : afterProto;
    const pathAndQuery = firstSlash !== -1 ? afterProto.slice(firstSlash) : "";

    const atTokens = authAndHost.split("@");
    if (atTokens.length > 2) {
      // Multiple '@' detected; password contains unescaped '@'
      const host = atTokens[atTokens.length - 1];
      const userPass = atTokens.slice(0, atTokens.length - 1).join("@");
      const colonIdx = userPass.indexOf(":");
      if (colonIdx !== -1) {
        const username = userPass.slice(0, colonIdx);
        const password = userPass.slice(colonIdx + 1);
        return `${protocol}://${username}:${encodeURIComponent(password)}@${host}${pathAndQuery}`;
      }
    }
    return rawUri;
  } catch {
    return rawUri;
  }
};

export const connectDB = async () => {
  const rawUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/imovies";
  const uri = sanitizeMongoUri(rawUri);

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    console.warn("Please make sure MongoDB is running locally or specify a valid MONGO_URI in server/.env (e.g. MongoDB Atlas)");
    throw error;
  }
};
