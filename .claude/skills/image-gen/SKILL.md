---
name: Image Generation
description: Generate images using OpenAI's GPT Image model. Use for creating images from text prompts. Keywords: image, generate, openai, gpt-image, dalle, picture, art, create.
---

# Image Generation

AI image generation powered by OpenAI's GPT Image model (chatgpt-image-latest).

## Variables

- **IMAGE_GEN_CLI_PATH**: `.claude/skills/image-gen/image_gen_cli/`

## Instructions

Run from IMAGE_GEN_CLI_PATH:
```bash
cd .claude/skills/image-gen/image_gen_cli/
uv run img --help                  # Discover all commands
uv run img generate --help         # Detailed usage
```

**Rules:**
- **Requires OPENAI_API_KEY** - must be set in environment or .env
- **Saves to file** - outputs PNG/JPEG/WebP to specified path
- **Cost aware** - high quality + large size = more tokens = higher cost

## Troubleshooting

- **"OPENAI_API_KEY not found"**: Add `OPENAI_API_KEY=sk-...` to .env
- **"Rate limit exceeded"**: Wait and retry, or upgrade API tier
