import React from "react";
import { render } from "@testing-library/react";
import App from "./App";

it("加载应用,默认显示正在加载", () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/正在加载/i);
  expect(linkElement).toBeInTheDocument();
});
