# BGM 音频文件说明

音频文件体积较大（约 23MB），已通过 .gitignore 排除，不入 Git 仓库。

## 需要放置的文件

将以下两个 MP3 文件放到 `frontend/public/` 目录下：

| 文件名 | 曲目 | 参考大小 |
|-------|------|---------|
| `bgm.mp3` | Merry Christmas Mr. Lawrence - 坂本龍一 | ~13MB |
| `bgm-2.mp3` | Reach Me - Luv Letter(钢琴版) | ~10MB |

## 如何获取

- 使用你自己的音乐文件，重命名后放入即可
- 或使用任意轻量级 MP3（建议压缩至 3-5MB 以内）
- 建议码率：128kbps，格式：MP3

## 自定义曲目

编辑 `frontend/src/components/common/BgmPlayer.vue` 中的 `tracks` 数组：

```js
const tracks = [
  { name: '曲名 - 艺术家', src: '/your-file.mp3' },
  // 添加更多...
]
```
