import ocel


class Env(ocel.Env):
    greeting: str = "hello"
    api_key: ocel.Secret
