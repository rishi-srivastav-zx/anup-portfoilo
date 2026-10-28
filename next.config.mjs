/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    reactCompiler: true,
    allowedDevOrigins: ["192.168.29.187", "localhost"],
    async redirects() {
        return [
            {
                source: "/login",
                destination: "/login-page",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
