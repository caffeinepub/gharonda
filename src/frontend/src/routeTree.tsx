import { Outlet, createRootRoute, createRoute } from "@tanstack/react-router";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import MessagingPage from "./pages/MessagingPage";
import MyPropertiesPage from "./pages/MyPropertiesPage";
import PostPropertyPage from "./pages/PostPropertyPage";
import ProfilePage from "./pages/ProfilePage";
import PropertyDetailPage from "./pages/PropertyDetailPage";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const propertyDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/property/$id",
  component: PropertyDetailPage,
});

const postPropertyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/post-property",
  component: PostPropertyPage,
});

const messagingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inbox",
  component: MessagingPage,
});

const myPropertiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-properties",
  component: MyPropertiesPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

export const routeTree = rootRoute.addChildren([
  homeRoute,
  propertyDetailRoute,
  postPropertyRoute,
  messagingRoute,
  myPropertiesRoute,
  profileRoute,
]);
