import type { Router } from "express";

export type AppModule = {
  path: string;
  router: Router;
};
