// This file fixes phantom TypeScript errors for non-existent files

declare module "hooks/use-auth" {
  const useAuth: any;
  export { useAuth };
}

declare module "app/api/debug-auth/route" {
  const handler: any;
  export default handler;
}
