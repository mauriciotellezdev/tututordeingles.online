module.exports = {
  create(context) {
    return {
      Literal(node) {
        if (
          typeof node.value === "string" &&
          node.value.startsWith("/api/")
        ) {
          context.report({
            node,
            message:
              "Don't use fetch('/api/...') — use a server action instead ('use server').",
          });
        }
      },
    };
  },
};