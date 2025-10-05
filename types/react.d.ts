declare module "react" {
  export * from "@types/react";
}

declare module "react-dom" {
  export * from "@types/react-dom";
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
