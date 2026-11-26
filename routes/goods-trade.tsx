import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/goods-trade")({
  beforeLoad: () => {
    throw redirect({ to: "/forex-trading" });
  },
});
