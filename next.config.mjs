import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  sassOptions: {
    loadPaths: [
      path.join(__dirname, "node_modules/bootstrap/scss"),
      path.join(__dirname, "src/assets/scss"),
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default config;
