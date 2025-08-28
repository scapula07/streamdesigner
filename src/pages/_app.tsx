import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import Router from "next/router";
import NProgress from "nprogress";
import AuthGuard from "@/components/AuthGuard";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false});

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());
export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="font-sans">
         <RecoilRoot>
              <AuthGuard>
                  <Component {...pageProps} />;
              </AuthGuard>
          </RecoilRoot>
     </div>
  )

}