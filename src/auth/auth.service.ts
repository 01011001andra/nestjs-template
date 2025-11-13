import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new HttpException('Invalid Credentials', 401);
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const { id } = user;

      const token = this.jwtService.sign({ id });
      const initial = await this.getInitial(user.id);

      return {
        initial,
        token,
      };
    } else {
      throw new HttpException('Invalid Credentials', 400);
    }
  }

  logout() {
    throw new UnauthorizedException('Logout succeed');
  }

  async register(createUserDto: RegisterDto) {
    await this.isUserExist(createUserDto.email);

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(String(createUserDto.password), salt);
    const user = await this.prisma.user.create({
      data: { ...createUserDto, password: String(hashPassword) },
    });

    return user;
  }

  async getInitial(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const data = {
      user: {
        id: user.id,
        name: user.name,
        image: user?.image,
        email: user.email,
      },
      assistant: {
        name: 'Muscash Assistant',
        status: 'Online',
        info: {
          title: 'MusCash Assistant',
          content: `
  <p><strong>Muscash Assistant</strong> membantu kamu mencatat transaksi dan melihat ringkasan keuangan lewat perintah singkat, langsung dari chat.</p>



  <h3>Cara Pakai</h3>
  <ol>
    <li>Ketik perintah di kolom pesan (contoh di bawah).</li>
    <li>Asisten akan mem-parsing teks jadi data terstruktur.</li>
    <li>Jika format kurang lengkap, asisten akan meminta klarifikasi singkat.</li>
  </ol>

  <h3>Contoh Perintah</h3>
  <ul>
    <li><code>/catat beli jus apel 20rb</code> &mdash; mencatat pengeluaran cepat.</li>
    <li><code>/pengeluaran 24 Mei 2025</code> &mdash; ringkasan pengeluaran pada tanggal tertentu.</li>
    <li><code>/pemasukan 24 Mei 2025</code> &mdash; ringkasan pemasukan pada tanggal tertentu.</li>
    <li><code>/catat terima gaji 3jt</code> &mdash; mencatat pemasukan.</li>
    <li><code>/pengeluaran minggu ini</code> atau <code>/pemasukan bulan ini</code> &mdash; periode relatif.</li>
  </ul>

  <h3>Format Tanggal & Angka</h3>
  <ul>
    <li>Tanggal: <code>DD MMM YYYY</code> (contoh: <code>24 Mei 2025</code>) atau <code>24/05/2025</code>, <code>2025-05-24</code>.</li>
    <li>Nominal: <code>20rb</code>, <code>15.000</code>, <code>3jt</code>, <code>1,2jt</code>. Satuan default: IDR.</li>
    <li>Periode relatif: <code>hari ini</code>, <code>kemarin</code>, <code>minggu ini</code>, <code>bulan ini</code>, <code>tahun ini</code>.</li>
  </ul>



  <h3>Aturan Asisten</h3>
  <ul>
    <li>Gunakan perintah yang diawali <code>/</code> untuk tindakan tertentu (catat/ringkasan).</li>
    <li>Jika ada lebih dari satu angka dalam kalimat, angka terakhir dianggap nominal, sisanya dianggap jumlah/kuantitas jika relevan.</li>
    <li>Jika kategori tidak disebut, asisten akan mencoba menebak (mis. "beli" → pengeluaran).</li>
    <li>Asisten dapat menanyakan klarifikasi jika informasi penting hilang (tanggal/nominal).</li>
  </ul>

  <h3>Ketentuan</h3>
  <ul>
    <li>Data yang tersimpan mengikuti akun/ruang kerja aplikasi kamu.</li>
    <li>Hasil ringkasan berdasarkan transaksi yang sudah terekam pada periode yang diminta.</li>
    <li>Transaksi yang salah input bisa diperbaiki melalui halaman detail/riwayat.</li>
  </ul>

  <h3>Privasi & Penyimpanan</h3>
  <p>Sesi percakapan bersifat sementara di sisi klien. Konten chat <em>tidak</em> disimpan; hanya data transaksi yang kamu setujui yang disimpan ke basis data aplikasi.</p>

  <h3>Batasan</h3>
  <ul>
    <li>Asisten tidak melakukan transfer uang/bayar tagihan.</li>
    <li>Bahasa utama: Indonesia; istilah umum Inggris masih dikenali (mis. <code>salary</code>, <code>lunch</code>).</li>
  </ul>

  <h3>Kesalahan Umum & Solusi</h3>
  <ul>
    <li><strong>Nominal tidak dikenali:</strong> tulis jelas, mis. <code>15.000</code> atau <code>15k</code>/<code>15rb</code>.</li>
    <li><strong>Tanggal ambigu:</strong> gunakan format lengkap <code>DD MMM YYYY</code> atau ISO <code>YYYY-MM-DD</code>.</li>
    <li><strong>Kategori tidak sesuai:</strong> sebutkan kata kunci (mis. <code>makan</code>, <code>transport</code>, <code>gaji</code>).</li>
  </ul>



  <p><strong>Catatan:</strong> Anda sedang berinteraksi dengan asisten otomatis. Sesi percakapan ini bersifat sementara dan tidak disimpan; seluruh pesan akan terhapus saat aplikasi dimulai ulang.</p>
`,
          button: 'Mengerti',
        },
        default: `👋 Halo! Aku Muscash Bot.
Kamu bisa ketik perintah seperti:
• /catat beli jus apel 20rb
• /pengeluaran 24 Mei 2025
• /pemasukan 24 Mei 2025

—
Perhatian:
Anda sedang berinteraksi dengan asisten otomatis. Sesi percakapan ini bersifat sementara dan tidak disimpan; seluruh pesan akan terhapus saat aplikasi dimulai ulang.
`,
        quickActions: [
          { name: 'Pemasukan', value: '/pemasukan ' },
          { name: 'Pengeluaran', value: '/pengeluaran ' },
          { name: 'Catatan Transaksi', value: '/catat ' },
        ],
      },
    };
    // throw new UnauthorizedException('Logout succeed');

    return data;
  }

  async isUserExist(email: string) {
    const isUserExist = await this.prisma.user.findUnique({
      where: { email },
    });

    if (isUserExist) {
      throw new ConflictException('User already exist');
    }
  }
}
