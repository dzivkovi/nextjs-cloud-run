# Cloud Build CI/CD Configuration

This directory contains Cloud Build configurations for the Next.js application.

## Files Overview

- `cloudbuild.yaml` - Full CI/CD pipeline auto-generated from Cloud Run console following the tutorial [Run your Next.js app on Cloud Run](https://www.youtube.com/watch?v=xzgkSAh-6sg)
- `cloudbuild-build.yaml` - Build-only configuration for testing builds without deployment
- `cloudbuild-deploy.yaml` - Deploy-only configuration for deploying previously built images

## How to Use

### Full CI/CD Pipeline (cloudbuild.yaml)

This configuration builds the Next.js app, pushes it to Artifact Registry, and deploys to Cloud Run. Execute with:

```bash
gcloud builds submit --config=.ci/cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=nextjs-cloud-run,\
_DEPLOY_REGION=us-central1,\
_AR_HOSTNAME=us-central1-docker.pkg.dev,\
_TRIGGER_ID=manual-trigger,\
REPO_NAME=nextjs-cloud-run,\
COMMIT_SHA=$(git rev-parse HEAD || echo 'latest')
```

### Separated Build and Deploy Pipelines

#### 1. Build Only (cloudbuild-build.yaml)

For building the application:

```bash
gcloud builds submit --config=.ci/cloudbuild-build.yaml
```

#### 2. Deploy Only (cloudbuild-deploy.yaml)

For deploying a previously built image:

```bash
gcloud builds submit --config=.ci/cloudbuild-deploy.yaml \
  --substitutions=_SERVICE_NAME=nextjs-cloud-run,\
  _DEPLOY_REGION=us-central1,\
  _AR_HOSTNAME=us-central1-docker.pkg.dev,\
  REPO_NAME=nextjs-cloud-run,\
  _COMMIT_SHA=$(git rev-parse HEAD || echo 'latest')
```

## Pipeline Stages

### Build Pipeline (cloudbuild-build.yaml)

- Builds the application using Cloud Native Buildpacks
- Creates a container image

### Deploy Pipeline (cloudbuild-deploy.yaml)

- Pushes the container image to Artifact Registry
- Deploys the image to Cloud Run

## Prerequisites

1. Install dependencies before running builds:

    ```bash
    npm install
    ```

2. Ensure you have necessary GCP permissions for:

    - Cloud Build
    - Artifact Registry
    - Cloud Run (for deployment pipelines)

## Environment Variables

The configurations use various substitutions:

- `_SERVICE_NAME`: Name of the Cloud Run service
- `_DEPLOY_REGION`: GCP region for deployment
- `_AR_HOSTNAME`: Artifact Registry hostname
- `REPO_NAME`: Repository name
- `_COMMIT_SHA`: Git commit hash (auto-generated)

## Container Images

The application images are stored in Artifact Registry under the following path:

```bash
us-central1-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/nextjs-cloud-run/nextjs-cloud-run
```

To list all available image tags:

```bash
export PROJECT_ID=$(gcloud config get-value project)

gcloud artifacts docker images list \
  us-central1-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/nextjs-cloud-run/nextjs-cloud-run
```

You can also view images in the GCP Console:

1. Navigate to Artifact Registry
2. Click on `cloud-run-source-deploy` repository
3. Browse `nextjs-cloud-run` folder
4. View images with different commit SHAs as tags

## Cleanup

To remove the Cloud Run service:

```bash
gcloud run services delete nextjs-cloud-run \
  --region=us-central1 \
  --quiet
```

To remove container images for this application (only):

```bash
# List all tags for this application first
gcloud artifacts docker images list \
  us-central1-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/nextjs-cloud-run/nextjs-cloud-run

# Delete all tags for this application
gcloud artifacts docker images delete \
  us-central1-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/nextjs-cloud-run/nextjs-cloud-run \
  --delete-tags --quiet
```

⚠️ **Warning**: These cleanup commands permanently delete resources. Make sure you have backups if needed and you're deleting the correct resources.
