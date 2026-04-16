# Session Mode

```yaml
mode: multi
cwd: fixed
permissions: sandboxed
bash-policy: allow-all
update:
  enabled: true
  repo: steve-krisjanovs/toneai-nux-qr-ironbound
  check: on-session-start
```

Each tone session is its own session. The working directory is locked to the project root — all generated QR output goes to `./output/`.
