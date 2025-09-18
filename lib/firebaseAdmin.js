import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let app;

if (!getApps().length) {
  app = initializeApp({
    credential: cert({
      projectId: 'nextsis-c11bb',
      clientEmail: 'firebase-adminsdk-fbsvc@nextsis-c11bb.iam.gserviceaccount.com',
      privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCxs8f51Xc94V6p\nzc9WYPusN+38zEjId0mLSR1biVeYq8HlJ80mKvMSfA2HWms/Kj7zTeJdj4/azKYu\n224Zm4QtiZCj8ZUPtYUtMUw7X0jOkn2j1PVLTv0MUhC9u0nqG6VLIv8PDyGCksov\nI2yNOGHxkCGcTOOCUVaXIvOmFvkyVbd5srM6jJix2/TL+bVsoWaCjwvDjlar/yCI\n+I59okF4T+ARCG/enIvQNrpcxdwQ6VcSVRgai+8fyryT6DYST75EjhT9SK8h35M5\nidtxpyN5pF9Z+WC2breB2Cxze51TgAp1W3IMzN+DfdbihyhPiYxniR3g8aID8Nu/\nkJa3QCAVAgMBAAECggEABoIbXZzSFm/Z3/Wz9YmtRgAxZOwVcVQfGy0VGGxmCycl\nPY+Q3ag+iUuGUlH/MgvJzO7qDruqjNyobHhoZqMxuto6NCrtpuriwwY2cMk7WSd3\n1wd+aWDt9yTNTKmemiajjeYs+b/33fii04mkWOK7AZYiCP+u6G+ysGvdCRT30P5P\nj5vuUC0QJHTk/lwmr4hvvas+tOIerY5hAV3/T+kA6u8exbpKxqx7YyKZCynLNtt+\nWf03u3f8MmpN+7p+D9Nl05XPPQ0bq3DMOnSEgAIQH3N7zYCrzQv5419NfIZICRRP\nAYCgq3Cddm0Kwo13z2D37asPCwRoSrS3PbBZNkqxeQKBgQDWBx0c9ka23wpQa9PF\n82Pu14O7a2bKic3gW0ipz2qkBCAMq6f1ctvCzlXyDdcjpc3N94UhLNql4VuWgyrZ\n8Yx0rR/sk2B/l6s3R25GLiVdIuv3zSTvKK+qml/dHDkUw0M0u0f6Cy5hF2UFDaBB\nqtLd8zXh1zqJCpLI/Yl4uVfpDQKBgQDUjQJUoq0k4Y9jPDdsDeepF3zcqahoTiDf\nXL+h7IznjzhPPUR7EIIlLAIzLQ9eu0pVx1IB5OWcEpJov4z8vnUXu1vU+HfvD7bO\nu8RlnNMBc3q0LwCesvdYRcKBAegpwvE70P4lXiOcQTiOd/Q4i2gR+eLMCqCImozE\ndMy1Bx3BKQKBgF+JUV+KN0qOCQaY+zETUfpdTTot2PZzyOhrFuZl5c5M4RmGzjRs\nDtjITej8cJpC+rkD0fNbGEaPb9ihuFEM14uFdAigSKTryMumIP1Gv/rxCa/VbLUs\nzi0zN7N1U62G88roBlsA/rTsQnWc/XoSjInydIzZDBH8HEWHlwPCiBFJAoGAB3TG\n3ycxwbhz6jxDiXPXa5QaWjdNZBNRjeRYCJseukTI6eaxT0vd9OXdUeRDxMP3MJkk\nZFKeR2JTZn9Jt9gKjYGSEB+DPYykkg3+Lr5YnJVreYSoleibSqpvz0y80zI2ei2z\nrKXnw+R50m2c0Jr7VJ4aeaPpy8D4LTAXukX8ojkCgYBYmSwrZ2FOh2lo3mNI2gMj\n/8VsKsS4h0ZmYttvJkEXbO159FA+Z2xdKKy74JMkolzhUFhe0/BUeNeakAVmk3C0\nOrwk2e+TF6MRWie5A4lvVQAkKqc216znY/LvclFu+y8zfKIz/cC5cthd4msi8d42\nqZzHpUcmeQ4Z6tBDQZoqFw==\n-----END PRIVATE KEY-----\n',
    }),
  });
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
export { auth };
