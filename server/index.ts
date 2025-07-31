import express from 'express';
import cors from 'cors';
import path from 'path';
import zlib from 'zlib';
import fs from 'fs';
import authRoutes from './routerExpress/auth';
import { configureSession } from './routerExpress/auth/config';

// tRPC related imports
import { createContext } from './context';
import { appRouter } from './routerTrpc/_app';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { createOpenApiExpressMiddleware } from 'trpc-to-openapi';

// API documentation
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './swagger';

// Express router imports
import fileRouter from './routerExpress/file/file';
import uploadRouter from './routerExpress/file/upload';
import deleteRouter from './routerExpress/file/delete';
import s3fileRouter from './routerExpress/file/s3file';
import pluginRouter from './routerExpress/file/plugin';
import rssRouter from './routerExpress/rss';
import openaiRouter from './routerExpress/openai';

// Attempt to require libsql on startup. If not available (e.g. on ARMv7),
// gracefully disable vector search features.
import { createRequire } from 'module';
const requireLib = createRequire(import.meta.url);
try {
  requireLib('@libsql/client');
} catch (e) {
  console.warn(
    'libsql no está disponible en esta arquitectura. Desactivando búsqueda vectorial.'
  );
}

// Vite integration
import ViteExpress from 'vite-express';

// Process error handling
process.on('uncaughtException', (error) => {
  console.error('uncaughtException:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('unhandledRejection:', reason);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT');
});

process.on('exit', (code) => {
  console.log(`process exit, code: ${code}`);
});

// Server configuration
const app = express();
const PORT = 1111;
const appRootDev = path.resolve(__dirname, '../app');
const appRootProd = path.resolve(__dirname, '../server');
let server: any = null;

if (process.env.NODE_ENV === 'production') {
  // Vite configuration
  ViteExpress.config({
    mode: 'production',
    inlineViteConfig: {
      //docker production dir /dist not development dir
      root: appRootProd,
      build: { outDir: "public" }
    }
  });
} else {
  ViteExpress.config({
    viteConfigFile: path.resolve(appRootDev, 'vite.config.ts'),
    inlineViteConfig: {
      root: appRootDev,
    }
  });
}

// Global error handler
const errorHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('express error:', err);
  res.status(500).json({
    error: {
      message: 'Internal Server Error',
      ...(process.env.NODE_ENV !== 'production' ? { details: err.message, stack: err.stack } : {})
    }
  });
};

/**
 * Setup all API routes for the application
 */
async function setupApiRoutes(app: express.Application) {
  // Authentication routes
  app.use('/api/auth', authRoutes);

  // tRPC endpoint with adapter for Express
  app.use('/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext: ({ req, res }) => {
        return createContext(req, res);
      },
      onError: ({ error }) => {
        console.error('tRPC error:', error);
      }
    })
  );

  // File handling endpoints
  app.use('/api/file', fileRouter);
  app.use('/api/file/upload', uploadRouter);
  app.use('/api/file/delete', deleteRouter);
  app.use('/api/s3file', s3fileRouter);
  
  // Special handling for lute.min.js with gzip compression
  app.use('/dist/js/lute/lute.min.js', (req, res) => {
    const filePath = path.resolve(__dirname, './lute.min.js');
    
    // Check if client accepts gzip encoding
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const supportsGzip = acceptEncoding.includes('gzip');
    
    res.set({
      'Cache-Control': 'public, max-age=604800, immutable',
      'Expires': new Date(Date.now() + 604800000).toUTCString(),
      'Content-Type': 'application/javascript'
    });
    
    if (supportsGzip) {
      // Send gzip compressed version
      res.set('Content-Encoding', 'gzip');
      const readStream = fs.createReadStream(filePath);
      const gzipStream = zlib.createGzip({ level: 6 });
      readStream.pipe(gzipStream).pipe(res);
    } else {
      // Send uncompressed version
      res.sendFile(filePath);
    }
  });
  
  app.use('/dist/js/icons/ant.js', (req, res) => {
    res.set({
      'Cache-Control': 'public, max-age=604800, immutable',
      'Expires': new Date(Date.now() + 604800000).toUTCString()
    });
    res.sendFile(path.resolve(__dirname, './lute.min.js'));
  });
  app.use('/plugins', pluginRouter);

  // Other API endpoints
  app.use('/api/rss', rssRouter);
  app.use('/v1', openaiRouter);

  // OpenAPI documentation endpoints
  app.get('/api/openapi.json', (req, res) => {
    res.json(openApiDocument);
  });

  // Swagger UI configuration
  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Blinko API Document',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true
    }
  }));

  // OpenAPI integration
  app.use('/api',
    // @ts-ignore
    createOpenApiExpressMiddleware({
      router: appRouter,
      createContext: ({ req, res }: { req: express.Request; res: express.Response }) => {
        return createContext(req, res);
      }
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
}

/**
 * Bootstrap the server
 * Sets up middleware, auth, API routes and starts the server
 */
async function bootstrap() {
  console.log('bootstrap');
  try {
    app.use(cors({
      origin: true,
      credentials: true
    }));

    if (process.env.TRUST_PROXY === '1') {
      app.set('trust proxy', 1);
    }

    const staticOptions = {
      maxAge: '7d',
      immutable: true,
      setHeaders: (res: express.Response, path: string) => {
        const ext = path.split('.').pop()?.toLowerCase();
        if (['png', 'webp', 'svg', 'json', 'ico', 'gif', 'mp4'].includes(ext || '')) {
          res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
          res.setHeader('Expires', new Date(Date.now() + 604800000).toUTCString());
        }
      }
    };

    const publicPath = path.resolve(appRootProd, 'public');
    app.use(express.static(publicPath, staticOptions));

    // Add body parsers for JSON and form data
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    await configureSession(app);

    // Setup API routes
    await setupApiRoutes(app);
    //@ts-ignore
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      errorHandler(err, req, res, next);
    });

    // Start or update server
    if (!server) {
      const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`🎉server start on port http://0.0.0.0:${PORT} - env: ${process.env.NODE_ENV || 'development'}`);
      });
      ViteExpress.bind(app, server); // the server binds to all network interfaces
    } else {
      console.log(`API routes updated - env: ${process.env.NODE_ENV || 'development'}`);
    }
  } catch (err) {
    console.error('start server error:', err);
    try {
      // Attempt to start server even if route setup fails
      if (!server) {
        const server = app.listen(PORT, "0.0.0.0", () => {
          console.log(`🎉server start on port http://0.0.0.0:${PORT} - env: ${process.env.NODE_ENV || 'development'}`);
        });
        ViteExpress.bind(app, server); // the server binds to all network interfaces
      }
    } catch (startupError) {
      console.error('start server error:', startupError);
    }
  }
}

// Start the server
bootstrap(); 
