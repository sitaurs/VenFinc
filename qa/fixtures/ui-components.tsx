import {
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  InlineAlert,
  LoadingRegion,
  MoneyText,
  Navigation,
  NavigationLink,
  Skeleton,
  StatusBadge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextField,
  Toast,
} from "../../packages/ui/src";
import "./ui-components.css";

export default function UiComponentFixture() {
  return (
    <main id="main-content" className="public-content component-gallery">
      <h1>Komponen VenFinance</h1>

      <section aria-labelledby="gallery-actions">
        <h2 id="gallery-actions">Tindakan</h2>
        <div className="component-button-group">
          <Button>Simpan perubahan</Button>
          <Button variant="secondary">Aksi sekunder</Button>
          <Button variant="danger" disabled>
            Hapus tidak tersedia
          </Button>
          <Button loading>Simpan sedang diproses</Button>
          <Button asChild loading>
          <a
            href="/demo"
            onClick={(event) => {
              if (!event.defaultPrevented) {
                document.body.dataset.navigationAttempted = "true";
              }
            }}
          >
            Buka demo sedang diproses
          </a>
          </Button>
        </div>
      </section>

      <section aria-labelledby="gallery-field">
        <h2 id="gallery-field">Input dengan validasi</h2>
        <TextField
          id="nickname"
          label="Nama panggilan"
          description="Nama ini hanya tampil pada akunmu."
          error="Nama panggilan wajib diisi."
          defaultValue=""
          autoComplete="nickname"
        />
      </section>

      <section aria-labelledby="gallery-tabs">
        <h2 id="gallery-tabs">Navigasi tab</h2>
        <Navigation label="Navigasi komponen">
          <ul className="ui-navigation-list">
            <li>
              <NavigationLink href="#gallery-tabs" current>
                Ringkasan
              </NavigationLink>
            </li>
            <li>
              <NavigationLink href="#gallery-status">Status</NavigationLink>
            </li>
          </ul>
        </Navigation>
        <Tabs defaultValue="summary">
          <TabsList label="Ringkasan uji">
            <TabsTrigger value="summary">Ringkasan</TabsTrigger>
            <TabsTrigger value="activity">Aktivitas</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">Konten ringkasan.</TabsContent>
          <TabsContent value="activity">Konten aktivitas.</TabsContent>
        </Tabs>
      </section>

      <section aria-labelledby="gallery-dialog">
        <h2 id="gallery-dialog">Dialog konfirmasi</h2>
        <DialogRoot>
          <DialogTrigger asChild>
            <Button variant="secondary">Buka konfirmasi</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Konfirmasi tindakan</DialogTitle>
            <DialogDescription>
              Tekan Escape atau pilih Batal untuk menutup dialog.
            </DialogDescription>
            <DialogClose asChild>
              <Button variant="secondary">Batal</Button>
            </DialogClose>
          </DialogContent>
        </DialogRoot>
      </section>

      <section aria-labelledby="gallery-status">
        <h2 id="gallery-status">Status dan pesan</h2>
        <StatusBadge tone="pending" label="Menunggu verifikasi" />
        <InlineAlert tone="error" title="Perlu diperbaiki">
          Periksa kembali kolom yang ditandai.
        </InlineAlert>
        <Toast>Perubahan lokal disimpan.</Toast>
      </section>

      <section aria-labelledby="gallery-loading">
        <h2 id="gallery-loading">Memuat data</h2>
        <LoadingRegion label="Memuat transaksi">
          <Skeleton className="skeleton-line" style={{ width: "80%" }} />
        </LoadingRegion>
      </section>

      <section aria-labelledby="gallery-money">
        <h2 id="gallery-money">Nominal uang</h2>
        <div className="component-money-values">
          <MoneyText amountMinor="9007199254740993" />
          <MoneyText amountMinor="-3250" />
          <MoneyText amountMinor="4000000" masked />
        </div>
      </section>
    </main>
  );
}
