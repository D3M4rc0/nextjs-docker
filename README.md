# ⚡ nextjs-docker

## 🎯 Goal

This Dockerfile is optimized for **the fastest possible builds** in CI/CD environments where Docker images are rebuilt multiple times per day. It leverages advanced caching strategies, multi-stage builds, and modern Docker features to minimize build times on subsequent runs while keeping the final image size minimal.

Key optimizations include:
- ⚡ **BuildKit cache mounts** for dependency and build artifact caching
- 🏗️ **Multi-stage builds** to separate build dependencies from runtime
- 🚀 **Bun** for ultra-fast dependency installation (up to 25x faster than npm)
- 📦 **Next.js standalone output** for minimal runtime footprint
- 🎯 **Strategic layer ordering** to maximize Docker layer caching

---

## 📋 Dockerfile Breakdown

### 🔧 Syntax Declaration & Base Layer

```dockerfile
# syntax=docker/dockerfile:1.7

FROM oven/bun:1-slim AS base
ENV NODE_ENV=production
```

**Purpose:** This section establishes the foundation for all subsequent build stages.

- `# syntax=docker/dockerfile:1.7` - Enables the latest Docker BuildKit features, including cache mounts and improved performance. This MUST be the first line.
- `FROM oven/bun:1-slim AS base` - Uses Bun's slim image as the base. Bun is a fast JavaScript runtime and package manager that significantly speeds up dependency installation. The `AS base` creates a named stage for reuse.
- `ENV NODE_ENV=production` - Sets the environment to production, which optimizes dependency installation (skips devDependencies in later stages if needed) and enables production optimizations.

---

### 🏗️ Builder Layer: Workspace Setup

```dockerfile
FROM base AS builder
WORKDIR /app
```

**Purpose:** This stage handles the complete build process - dependency installation and Next.js compilation.

- `FROM base AS builder` - Creates a new build stage inheriting from our base layer. This stage will contain all build tools and will be discarded in the final image.
- `WORKDIR /app` - Sets the working directory for all subsequent commands. Creates the directory if it doesn't exist.

---

### 📦 Builder Layer: Dependency Installation

```dockerfile
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --ignore-scripts
```

**Purpose:** Install dependencies with maximum caching efficiency to speed up rebuilds.

- `COPY package.json bun.lock ./` - Copies only the dependency manifests first. This is crucial for layer caching: if these files haven't changed, Docker will reuse this layer and skip reinstallation.
- `RUN --mount=type=cache,target=/root/.bun/install/cache` - Creates a persistent cache mount for Bun's download cache. This cache persists between builds, so packages don't need to be re-downloaded if they're already cached.
- `bun install --frozen-lockfile` - Installs dependencies exactly as specified in the lockfile (no version updates), ensuring reproducible builds.
- `--ignore-scripts` - Skips lifecycle scripts for faster, more secure installation.

---

### ⚙️ Builder Layer: Application Build

```dockerfile
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN --mount=type=cache,target=/app/.next/cache \
    bun run build --no-lint
```

**Purpose:** Copy the application code and build the Next.js application with caching for the build artifacts.

- `COPY . .` - Copies the entire application source code into the container. This comes AFTER dependency installation so that code changes don't invalidate the dependency cache layer.
- `ENV NEXT_TELEMETRY_DISABLED=1` - Disables Next.js telemetry to speed up builds and avoid network calls.
- `RUN --mount=type=cache,target=/app/.next/cache` - Mounts a persistent cache for Next.js build cache. This dramatically speeds up rebuilds when only small code changes are made.
- `bun run build --no-lint` - Runs the Next.js build process using Bun (faster than npm/yarn). The `--no-lint` flag skips linting during build (assume it's done separately in CI).

---

### 🚀 Runtime Layer: Base Setup

```dockerfile
FROM node:22-slim AS runner

ARG GIT_REPOSITORY_URL
ARG GIT_COMMIT_SHA

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
```

**Purpose:** Create a minimal runtime environment with only what's needed to run the Next.js application.

- `FROM node:22-slim AS runner` - Starts a fresh stage from a minimal Node.js image. This creates a clean slate without any build tools, drastically reducing the final image size. We use Node (not Bun) because Next.js standalone output is optimized for Node.
- `ARG GIT_REPOSITORY_URL` and `ARG GIT_COMMIT_SHA` - Defines build arguments that can be passed during build time for tracking which version of code is in the image.
- `WORKDIR /app` - Sets the working directory in the runtime container.
- `ENV NODE_ENV=production` - Ensures Next.js runs in production mode.
- `ENV PORT=3000` - Sets the default port the application will listen on.
- `ENV HOSTNAME=0.0.0.0` - Configures Next.js to listen on all network interfaces, necessary for container networking.

---

### 🔒 Runtime Layer: Security & User Configuration

```dockerfile
RUN groupadd -g 1001 nodejs || true
RUN useradd -r -u 1001 -g nodejs service-user || true
```

**Purpose:** Create a non-root user for running the application, following security best practices.

- `RUN groupadd -g 1001 nodejs || true` - Creates a group named "nodejs" with GID 1001. The `|| true` ensures the command succeeds even if the group already exists.
- `RUN useradd -r -u 1001 -g nodejs service-user || true` - Creates a system user (-r) named "service-user" with UID 1001 in the nodejs group. Running as non-root is a critical security practice.

---

### 🎬 Runtime Layer: Application Files & Startup

```dockerfile
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER service-user
EXPOSE 3000
CMD ["node", "server.js"]
```

**Purpose:** Copy the minimal runtime files from the builder and configure the container startup.

- `COPY --from=builder /app/.next/standalone ./` - Copies the standalone output from the builder stage. Next.js standalone output includes only the necessary files to run the app (no source code, no devDependencies).
- `COPY --from=builder /app/.next/static ./.next/static` - Copies the static assets (JS, CSS bundles) generated during build.
- `COPY --from=builder /app/public ./public` - Copies the public folder containing static files like images, fonts, etc.
- `USER service-user` - Switches to the non-root user for running the application. All subsequent commands and the runtime process will run as this user.
- `EXPOSE 3000` - Documents that the container listens on port 3000 (doesn't actually publish the port).
- `CMD ["node", "server.js"]` - Sets the default command to run when the container starts. The standalone output creates a server.js file that runs the Next.js app.

---

## 🛠️ Building the Image

```bash
docker build \
  --build-arg GIT_REPOSITORY_URL=$(git config --get remote.origin.url) \
  --build-arg GIT_COMMIT_SHA=$(git rev-parse HEAD) \
  -t my-nextjs-app .
```

## ▶️ Running the Container

```bash
docker run -p 3000:3000 my-nextjs-app
```

## ⚡ CI/CD Performance Notes

This Dockerfile is specifically optimized for CI/CD scenarios where:

1. **Cache mounts persist** between builds (supported by most modern CI systems like GitHub Actions, GitLab CI, CircleCI)
2. **Layer caching** is enabled and reused across builds
3. **Dependencies change infrequently** compared to application code
4. **Multiple builds per day** benefit from cached downloads and build artifacts

Expected performance:
- 🐢 **First build:** 2-5 minutes (depending on project size)
- ⚡ **Subsequent builds with code changes:** 30-90 seconds
- 🚀 **Rebuilds with no changes:** 5-15 seconds
