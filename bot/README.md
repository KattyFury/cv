# bot — lấy giá hằng ngày cho tab Valuation

Chạy bằng Docker ngay trên PC nhà. Không cài package nào (Node 22 có `fetch` sẵn).

## Chạy

```bash
cd bot
cp .env.example .env      # rồi điền secret
docker compose up -d --build
docker compose logs -f
```

Bot chạy **ngay một lượt** lúc khởi động, sau đó **mỗi ngày lúc `RUN_AT_HOUR`** (mặc định 2h sáng, giờ Việt Nam). `restart: unless-stopped` nên Docker/PC bật lại là nó tự chạy tiếp.

```bash
docker compose restart      # chạy lại ngay
docker compose down         # dừng hẳn
```

## Nó làm gì

| Nguồn | Lấy về | Cho |
|---|---|---|
| CoinGecko `/coins/markets` | `atm` · `ath` · `athDate` | tất cả 78 dự án |
| Binance `/klines` `interval=1d` | `atl` · `atlDate` | dự án có `binanceSymbol` |

`atl` = **đáy thấp nhất trong khoảng [ngày lên sàn → ngày ATH]**, đã bỏ nến ngày lên sàn (râu nến hôm đó không phải giá trade được). ATH rơi ngay ngày lên sàn → không có khoảng trước → `atl` để trống.

Lượt chạy đầu: 78/78 có giá, **42 có đáy**, 28 không (thiếu cặp Binance hoặc ATH rơi quá sát ngày lên sàn).

## Ghi kết quả

Chỉ ghi key **`val-prices`**. Hai đường, tự chọn cái nào có cấu hình:

1. `ADMIN_PASS` → `POST /api/val` — đường chuẩn, đi qua whitelist trường của server
2. `CLOUDFLARE_API_TOKEN` → ghi thẳng KV — đường dự phòng, không cần mật khẩu

> ⚠️ **Không bao giờ đụng `priceTGE`.** Giá lúc TGE là dữ kiện lịch sử, chỉ có một giá trị, chủ site nhập tay, nằm ở key `val-projects`.

## Hai cái bẫy đã dính, đừng lặp lại

- **`binance-cli` bỏ qua `--start-time`** → không lấy được lịch sử. Phải gọi `fetch` REST thẳng.
- **Binance trả HTTP 451** cho server ở một số quốc gia (Apps Script từng dính). Đó là lý do bot chạy ở máy nhà chứ không phải Cloudflare Worker.

## Test nhanh

```bash
docker compose run --rm -e RUN_ONCE=true val-price-bot
```
