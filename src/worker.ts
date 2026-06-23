interface Env {
  ASSETS: Fetcher;
}

export default {
  fetch(request: Request, env: Env) {
    return env.ASSETS.fetch(request);
  },
};
