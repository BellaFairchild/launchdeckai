import React from "react";

export const Link = ({
  children,
  href,
}: {
  children?: React.ReactNode;
  href?: string;
}) => <>{children ?? href}</>;

export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
});

export const usePathname = () => "/";
export const useLocalSearchParams = () => ({});

export const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};
