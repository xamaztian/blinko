
<img align='right' height='40px' src="./public/logo.svg" alt="Blinko" />

# Blinko - Open Source, Self-hosted

<div align="center">

<!-- ![GitHub forks](https://img.shields.io/github/forks/blinko-space/blinko?style=social) -->
![GitHub issues](https://img.shields.io/github/issues/blinko-space/blinko)
![GitHub license](https://img.shields.io/github/license/blinko-space/blinko)
![GitHub last commit](https://img.shields.io/github/last-commit/blinko-space/blinko)
![GitHub release](https://img.shields.io/github/v/release/blinko-space/blinko)
![GitHub contributors](https://img.shields.io/github/contributors/blinko-space/blinko)
<!-- ![Downloads](https://img.shields.io/github/downloads/blinko-space/blinko/total) -->

[![Dependencies Status](https://img.shields.io/badge/dependencies-up%20to%20date-brightgreen.svg)](https://github.com/denser-org/denser-retriever/pulls?utf8=%E2%9C%93&q=is%3Apr%20author%3Aapp%2Fdependabot)
![Maintenance](https://img.shields.io/badge/Maintained-Actively-green)

</div>

<div align="center">

[Live Demo](https://demo.blinko.space) •
[中文文档](README.zh-CN.md) •
[Docs](https://docs.blinko.space/introduction) •
[Telegram Chinese](https://t.me/blinkoChinese) •
[Telegram English](https://t.me/blinkoEnglish)
</div>


> Live Demo: username:blinko password:blinko

[![Run on PikaPods](https://www.pikapods.com/static/run-button.svg)](https://www.pikapods.com/pods?run=blinko)

Blinko is an innovative open-source project designed for individuals who want to quickly capture and organize their fleeting thoughts. Blinko allows users to seamlessly jot down ideas the moment they strike, ensuring that no spark of creativity is lost.

<img style="border-radius:20px" src="./app/public/home.webp" alt="Blinko" />

## 🚀Main Features
- 🤖**AI-Enhanced Note Retrieval** ：With Blinko's advanced AI-powered RAG (Retrieval-Augmented Generation), you can quickly search and access your notes using natural language queries, making it effortless to find exactly what you need.

- 🔒**Data Ownership** :Your privacy matters. All your notes and data are stored securely in your self-hosted environment, ensuring complete control over your information.

- 🚀**Efficient and Fast** :Capture ideas instantly and store them as plain text for easy access, with full Markdown support for quick formatting and seamless sharing.

- 💡**Lightweight architecture with multi-platform support** :Built with Tauri, Blinko features a clean and lightweight architecture that delivers robust performance while maintaining exceptional speed and efficiency, with native support for multi-platform deployment including macOS, Windows, Android, and Linux.

- 🔓**Open for Collaboration** :As an open-source project, Blinko invites contributions from the community. All code is transparent and available on GitHub, fostering a spirit of collaboration and constant improvement.

## 📦Start with Docker in seconds

```bash
curl -s https://raw.githubusercontent.com/blinko-space/blinko/main/install.sh | bash
```

### ⚠️ Memory considerations on Raspberry Pi 3

The Raspberry Pi 3 only has 1 GB of RAM, so `docker-compose build` may fail due to memory pressure. Create a temporary swap file before building:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

Remove or disable the swap file afterwards if you no longer need it.

The Dockerfile also limits Node's heap via `NODE_OPTIONS=--max-old-space-size=512` to avoid out-of-memory errors. For large builds you can split steps or use a `package-lock.json` with `npm ci` to freeze dependencies and lower RAM usage.

### ARMv7 and libsql

`libsql` does not provide prebuilt binaries for the 32‑bit ARMv7 architecture used by the Raspberry Pi 3. The package is now optional and the build skips it on ARMv7.
This means vector search features that rely on `libsql` are disabled on these devices.
At runtime Blinkō detects the missing module and logs `⚠️ libsql no disponible: vector search deshabilitado en ARMv7`.

## 👨🏼‍💻Contribution
Contributions are the heart of what makes the open-source community so dynamic, creative, and full of learning opportunities. Your involvement helps drive innovation and growth. We deeply value any contribution you make, and we're excited to have you as part of our community. Thank you for your support! 🙌

[![Contributors](https://contrib.rocks/image?repo=blinko-space/blinko)]([...](https://github.com/blinko-space/blinko/graphs/contributors))

## Sponsorship
If you find Blinko valuable, consider supporting us! Your contribution will enable us to continue enhancing and maintaining the project for everyone. Thank you for helping us grow,Or use PikaPods to support blinko

[![Run on PikaPods](https://www.pikapods.com/static/run-button.svg)](https://www.pikapods.com/pods?run=blinko)

[https://ko-fi.com/blinkospace](https://ko-fi.com/blinkospace)

[https://afdian.com/a/blinkospace/plan](https://afdian.com/a/blinkospace/plan)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=blinko-space/blinko&type=Date)](https://star-history.com/#blinko-space/blinko&Date)


