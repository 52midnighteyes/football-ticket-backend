import { extend } from "zod/mini";
import { BlogCategory } from "../../generated/prisma/enums.js";

interface IBlogScriptItem {
  image: string;
  imagePublicId: string;
  title: string;
  content: string;
  category: BlogCategory;
  authorId: string;
}

export interface IScriptBLog extends IBlogScriptItem {
  excerpt: string;
  slug: string;
  isPublished: boolean;
}

export const blogsDummyData: IBlogScriptItem[] = [
  {
    title: "Persija Jakarta Tampil Lebih Tenang di Laga Kandang",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Dalam atmosfer Persija Jakarta, detail kecil seperti ritme permainan dan dukungan The Jak Mania sering jadi pembeda di sepak bola Indonesia.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Persija terlihat lebih rapi saat membangun serangan dari lini belakang, terutama ketika bermain di Jakarta dengan tekanan besar dari tribun.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Jika digunakan untuk cerita pertandingan, nuansa Persija, semangat Macan Kemayoran, dan gairah bola Indonesia bisa membuat isi tulisan terasa lebih hidup dan relevan.`,
    category: "MATCH",
    authorId: "33907d31-bda4-4dd6-98f7-347dfdce4e3c",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041904/2_v4g3je.jpg",
    imagePublicId: "2_v4g3je",
  },
  {
    title: "The Jak Mania Kembali Penuhi Tribun Jakarta",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Di tengah gairah Persija, suara The Jak Mania selalu memberi warna unik bagi atmosfer sepak bola Indonesia.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Dukungan suporter di Jakarta bukan cuma soal jumlah, tapi juga soal identitas, loyalitas, dan kebanggaan terhadap Persija.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Dalam konteks fans club, semangat tribun, chant, dan koreografi membuat cerita tentang Persija jadi terasa lebih kuat dan lebih dekat dengan budaya bola Indonesia.`,
    category: "FANS",
    authorId: "5dc6fdb2-078d-43dd-867d-d531abeda793",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041904/3_ok8siu.jpg",
    imagePublicId: "3_ok8siu",
  },
  {
    title: "Rizky Ridho Disebut Jadi Pilar Masa Depan Persija",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Dalam pembahasan pemain muda Persija, nama Rizky Ridho sering muncul sebagai simbol harapan bagi sepak bola Indonesia.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Bermain untuk klub sebesar Persija Jakarta menuntut konsistensi, ketenangan, dan karakter kuat di setiap pertandingan.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Bagi suporter seperti The Jak Mania, pemain yang tampil penuh determinasi biasanya cepat mendapat tempat spesial di hati pendukung Macan Kemayoran.`,
    category: "PLAYER",
    authorId: "ac260dbf-4b19-419c-b97f-a47a63111799",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/4_pqhtg6.jpg",
    imagePublicId: "4_pqhtg6",
  },
  {
    title: "Persija Mulai Fokus pada Sesi Training Intensif",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Dalam persiapan tim Persija, latihan intensif menjadi bagian penting demi menjaga daya saing di level bola Indonesia.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Setiap sesi training di Jakarta biasanya berfokus pada transisi, tekanan tinggi, dan chemistry antarpemain agar permainan lebih stabil.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Untuk klub besar seperti Persija, kualitas latihan sering dianggap sama pentingnya dengan hasil pertandingan karena itu membentuk fondasi jangka panjang.`,
    category: "TRAINING",
    authorId: "33907d31-bda4-4dd6-98f7-347dfdce4e3c",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/5_fltbwc.jpg",
    imagePublicId: "5_fltbwc",
  },
  {
    title: "Merch Persija Edisi Baru Disambut Antusias Suporter",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Bagi pendukung Persija Jakarta, merchandise resmi bukan sekadar produk, tapi bagian dari identitas klub di tengah budaya bola Indonesia.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Jersey, syal, dan aksesoris bertema Persija sering jadi incaran The Jak Mania, terutama menjelang laga besar atau event komunitas.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Kehadiran merchandise baru membuat hubungan emosional antara klub, kota Jakarta, dan suporternya terasa makin erat dari musim ke musim.`,
    category: "MERCH",
    authorId: "5dc6fdb2-078d-43dd-867d-d531abeda793",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/1_nquybp.jpg",
    imagePublicId: "1_nquybp",
  },
  {
    title: "Sejarah Persija Selalu Jadi Kebanggaan Warga Ibu Kota",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Dalam peta sejarah bola Indonesia, Persija Jakarta punya tempat yang sangat besar dan sulit dipisahkan dari identitas kota.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Banyak generasi tumbuh dengan cerita tentang Persija, rivalitas klasik, serta semangat The Jak Mania yang terus diwariskan.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Saat membahas sejarah klub, nama Persija hampir selalu muncul sebagai simbol tradisi, tekanan besar, dan kebanggaan warga Jakarta.`,
    category: "HISTORY",
    authorId: "ac260dbf-4b19-419c-b97f-a47a63111799",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041904/2_v4g3je.jpg",
    imagePublicId: "2_v4g3je",
  },
  {
    title: "Persija Dikabarkan Incar Tambahan Pemain Musim Ini",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Rumor transfer selalu menarik perhatian fans Persija, apalagi jika menyangkut pemain yang punya nama besar di bola Indonesia.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Klub sebesar Persija Jakarta memang selalu dituntut agresif di bursa transfer demi menjaga kedalaman skuad dan kualitas permainan.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Untuk The Jak Mania, kabar transfer bukan cuma soal pemain masuk, tapi juga tentang harapan baru untuk bersaing di papan atas.`,
    category: "TRANSFER",
    authorId: "33907d31-bda4-4dd6-98f7-347dfdce4e3c",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041904/3_ok8siu.jpg",
    imagePublicId: "3_ok8siu",
  },
  {
    title: "Persija Gelar Event Komunitas untuk Dekatkan Suporter",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Dalam konteks Persija Jakarta, kegiatan komunitas sering jadi cara efektif membangun hubungan yang lebih hangat dengan The Jak Mania.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Event seperti meet and greet, nobar, dan agenda sosial menjadi bagian dari budaya klub modern di tengah perkembangan bola Indonesia.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Ketika klub hadir lebih dekat ke suporter di Jakarta, rasa memiliki terhadap Persija biasanya ikut tumbuh semakin kuat.`,
    category: "EVENT",
    authorId: "5dc6fdb2-078d-43dd-867d-d531abeda793",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/4_pqhtg6.jpg",
    imagePublicId: "4_pqhtg6",
  },
  {
    title: "Berita Persija Hari Ini Soroti Konsistensi Lini Tengah",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Dalam berita terbaru soal Persija, keseimbangan lini tengah disebut sangat penting untuk menjaga tempo di sepak bola Indonesia.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Tim asal Jakarta ini butuh pemain yang bisa menahan tekanan, membuka ruang, dan tetap disiplin saat laga berjalan keras.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Bagi The Jak Mania, permainan yang solid kadang lebih penting daripada sekadar menang tipis tanpa arah permainan yang jelas.`,
    category: "NEWS",
    authorId: "ac260dbf-4b19-419c-b97f-a47a63111799",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/5_fltbwc.jpg",
    imagePublicId: "5_fltbwc",
  },
  {
    title: "Persija Menang Dramatis Lewat Gol Menit Akhir",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Kemenangan dramatis selalu punya tempat spesial bagi Persija dan pendukung setianya di panggung bola Indonesia.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Saat Persija Jakarta mencetak gol pada menit akhir, ledakan emosi The Jak Mania biasanya jadi momen yang sulit dilupakan.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Laga semacam ini sering dianggap mewakili karakter Macan Kemayoran yang tidak mudah menyerah sampai peluit terakhir berbunyi.`,
    category: "MATCH",
    authorId: "33907d31-bda4-4dd6-98f7-347dfdce4e3c",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/1_nquybp.jpg",
    imagePublicId: "1_nquybp",
  },
  {
    title: "Pemain Muda Persija Dapat Sorotan Positif dari Fans",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Kemunculan pemain muda di Persija sering jadi topik menarik karena publik Jakarta selalu menaruh harapan besar.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Dalam lanskap bola Indonesia, pembinaan pemain muda dianggap penting untuk menjaga masa depan klub dan kualitas kompetisi.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. The Jak Mania biasanya cepat memberi apresiasi jika ada pemain muda Persija yang tampil berani, disiplin, dan tidak gugup di laga besar.`,
    category: "PLAYER",
    authorId: "5dc6fdb2-078d-43dd-867d-d531abeda793",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041904/2_v4g3je.jpg",
    imagePublicId: "2_v4g3je",
  },
  {
    title: "Rumor Transfer Persija Semakin Ramai Menjelang Putaran Baru",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Bursa transfer selalu jadi momen yang memancing rasa penasaran pendukung Persija Jakarta.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Persija membutuhkan komposisi tim yang tepat agar mampu bersaing secara konsisten di kerasnya atmosfer bola Indonesia.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Setiap rumor pemain baru selalu dibahas panjang oleh The Jak Mania, terutama jika nama tersebut dianggap cocok dengan karakter klub ibu kota.`,
    category: "TRANSFER",
    authorId: "ac260dbf-4b19-419c-b97f-a47a63111799",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041904/3_ok8siu.jpg",
    imagePublicId: "3_ok8siu",
  },
  {
    title: "Berita Persija Fokus pada Evaluasi Pertahanan Tim",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Evaluasi pertahanan jadi isu penting saat membahas performa Persija di musim kompetisi yang ketat.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Klub asal Jakarta ini butuh keseimbangan antara agresivitas menyerang dan kedisiplinan bertahan agar tetap stabil.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Dalam perspektif bola Indonesia, pertahanan yang rapuh sering jadi alasan klub besar kehilangan momentum penting di papan klasemen.`,
    category: "NEWS",
    authorId: "33907d31-bda4-4dd6-98f7-347dfdce4e3c",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/4_pqhtg6.jpg",
    imagePublicId: "4_pqhtg6",
  },
  {
    title: "The Jak Mania Dinilai Tetap Loyal dalam Situasi Sulit",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Loyalitas The Jak Mania menjadi salah satu kekuatan emosional terbesar yang dimiliki Persija Jakarta.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Dalam situasi sulit, dukungan suporter sering memberi energi tambahan bagi pemain untuk tetap berjuang di lapangan.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Budaya suporter Persija sudah lama menjadi bagian tak terpisahkan dari wajah bola Indonesia dan identitas kota Jakarta.`,
    category: "FANS",
    authorId: "5dc6fdb2-078d-43dd-867d-d531abeda793",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/5_fltbwc.jpg",
    imagePublicId: "5_fltbwc",
  },
  {
    title: "Persija Punya Rekam Jejak Panjang di Sejarah Sepak Bola Nasional",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Persija bukan klub biasa karena sejarahnya tertanam kuat dalam perkembangan bola Indonesia sejak lama.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Dari era lama hingga modern, nama Persija Jakarta terus hadir sebagai simbol tradisi, tekanan, dan kebanggaan ibu kota.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Ketika sejarah klub dibahas, The Jak Mania sering menjadi bagian penting karena mereka ikut menjaga ingatan kolektif tentang perjalanan Persija.`,
    category: "HISTORY",
    authorId: "ac260dbf-4b19-419c-b97f-a47a63111799",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/1_nquybp.jpg",
    imagePublicId: "1_nquybp",
  },
  {
    title: "Sesi Latihan Persija Disebut Lebih Kompetitif Pekan Ini",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Intensitas latihan Persija meningkat sebagai respons terhadap tuntutan hasil dan ekspektasi tinggi dari publik Jakarta.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Dalam dunia bola Indonesia, tim yang berlatih dengan tempo tinggi biasanya dianggap lebih siap menghadapi tekanan kompetisi.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Persija butuh konsistensi di training ground agar ide permainan pelatih bisa benar-benar terlihat saat hari pertandingan.`,
    category: "TRAINING",
    authorId: "33907d31-bda4-4dd6-98f7-347dfdce4e3c",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041904/2_v4g3je.jpg",
    imagePublicId: "2_v4g3je",
  },
  {
    title: "Event Persija untuk Anak Muda Jakarta Dapat Respons Positif",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Klub seperti Persija semakin sadar bahwa event komunitas bisa memperluas ikatan dengan generasi baru penggemar.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Aktivasi di Jakarta memberi ruang bagi The Jak Mania dan masyarakat umum untuk merasakan kedekatan yang lebih nyata dengan klub.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Dalam konteks bola Indonesia modern, klub yang aktif membangun komunitas cenderung punya basis pendukung yang lebih solid dan loyal.`,
    category: "EVENT",
    authorId: "5dc6fdb2-078d-43dd-867d-d531abeda793",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041904/3_ok8siu.jpg",
    imagePublicId: "3_ok8siu",
  },
  {
    title: "Jersey Baru Persija Jadi Buruan Saat Hari Pertandingan",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Produk resmi Persija sering punya nilai emosional tinggi bagi suporter yang ingin menunjukkan identitas mereka.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Dari jersey sampai syal, merchandise Persija Jakarta menjadi bagian dari budaya tribun yang kuat di ibu kota.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. The Jak Mania sering menganggap merch resmi sebagai simbol loyalitas, bukan cuma barang koleksi biasa.`,
    category: "MERCH",
    authorId: "ac260dbf-4b19-419c-b97f-a47a63111799",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/4_pqhtg6.jpg",
    imagePublicId: "4_pqhtg6",
  },
  {
    title: "Persija Coba Bangkit Setelah Hasil Kurang Memuaskan",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Saat hasil pertandingan tidak sesuai harapan, tekanan terhadap Persija biasanya datang dari segala arah.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Klub besar di Jakarta memang selalu dituntut segera bangkit karena sorotan publik dan media sangat besar.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Namun dalam bola Indonesia, tim yang mampu bangkit dari momen sulit sering justru membangun karakter yang lebih kuat untuk akhir musim.`,
    category: "MATCH",
    authorId: "33907d31-bda4-4dd6-98f7-347dfdce4e3c",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/5_fltbwc.jpg",
    imagePublicId: "5_fltbwc",
  },
  {
    title: "Pemain Persija Ini Mulai Menarik Perhatian Publik",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Seorang pemain Persija yang tampil stabil biasanya cepat jadi bahan pembicaraan di kalangan pencinta bola Indonesia.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Bermain untuk Persija Jakarta bukan hal mudah karena tekanan performa datang dari suporter, media, dan besarnya nama klub.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. The Jak Mania biasanya menaruh ekspektasi besar pada pemain yang menunjukkan mental kuat dan tidak gampang tenggelam di laga penting.`,
    category: "PLAYER",
    authorId: "5dc6fdb2-078d-43dd-867d-d531abeda793",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/1_nquybp.jpg",
    imagePublicId: "1_nquybp",
  },
  {
    title: "Persija Cari Opsi Baru di Bursa Transfer Tengah Musim",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Bursa transfer tengah musim sering dimanfaatkan Persija untuk menutup celah dalam skuad.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Dengan tekanan kompetisi yang ketat di bola Indonesia, kedalaman tim bisa menentukan apakah klub mampu bertahan di jalur persaingan.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Bagi suporter Persija Jakarta, transfer yang tepat bisa mengubah optimisme tim dalam waktu singkat.`,
    category: "TRANSFER",
    authorId: "ac260dbf-4b19-419c-b97f-a47a63111799",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041904/2_v4g3je.jpg",
    imagePublicId: "2_v4g3je",
  },
  {
    title: "Kabar Persija Hari Ini Menyoroti Perubahan Taktik",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Perubahan pendekatan taktik sering jadi bahan evaluasi ketika performa Persija belum konsisten.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Klub sebesar Persija Jakarta harus mampu beradaptasi dengan karakter lawan dan intensitas kompetisi nasional.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Di level bola Indonesia, fleksibilitas taktik sering menjadi penentu apakah tim bisa mencuri poin di laga sulit.`,
    category: "NEWS",
    authorId: "33907d31-bda4-4dd6-98f7-347dfdce4e3c",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041904/3_ok8siu.jpg",
    imagePublicId: "3_ok8siu",
  },
  {
    title: "Suporter Persija Bikin Atmosfer Stadion Kian Hidup",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Dukungan suporter selalu menjadi elemen yang tidak bisa dilepaskan dari cerita Persija.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. The Jak Mania dikenal mampu membangun tekanan besar bagi lawan sekaligus menaikkan adrenalin tim tuan rumah di Jakarta.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Dalam wajah bola Indonesia modern, suasana tribun yang kuat sering menjadi alasan sebuah pertandingan terasa jauh lebih emosional.`,
    category: "FANS",
    authorId: "5dc6fdb2-078d-43dd-867d-d531abeda793",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/4_pqhtg6.jpg",
    imagePublicId: "4_pqhtg6",
  },
  {
    title: "Cerita Lama Persija Masih Hidup di Ingatan Suporter",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Banyak kisah lama Persija tetap diceritakan dari generasi ke generasi oleh suporter setia.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Sebagai klub besar dari Jakarta, Persija punya lapisan sejarah yang membuat identitasnya terasa lebih tebal dibanding banyak klub lain.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Sejarah itu juga hidup lewat cerita The Jak Mania yang menjaga memori tentang perjalanan Persija di sepak bola Indonesia.`,
    category: "HISTORY",
    authorId: "ac260dbf-4b19-419c-b97f-a47a63111799",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/5_fltbwc.jpg",
    imagePublicId: "5_fltbwc",
  },
  {
    title: "Latihan Pagi Persija Dinilai Lebih Disiplin",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Disiplin saat latihan sering disebut sebagai pondasi penting bagi tim seperti Persija.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Dalam persaingan bola Indonesia, tim yang rapi di sesi latihan biasanya punya struktur permainan yang lebih jelas saat bertanding.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Persija Jakarta perlu menjaga standar tinggi setiap hari karena ekspektasi publik ibu kota tidak pernah kecil.`,
    category: "TRAINING",
    authorId: "33907d31-bda4-4dd6-98f7-347dfdce4e3c",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/1_nquybp.jpg",
    imagePublicId: "1_nquybp",
  },
  {
    title: "Event Persija dan The Jak Mania Berjalan Meriah",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Kolaborasi event antara klub dan suporter selalu menarik untuk dibahas dalam konteks Persija.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Agenda komunitas di Jakarta menunjukkan bahwa hubungan Persija dengan The Jak Mania tidak berhenti di hari pertandingan saja.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Dalam ekosistem bola Indonesia, klub yang mampu merawat komunitasnya cenderung punya fondasi sosial yang jauh lebih kuat.`,
    category: "EVENT",
    authorId: "5dc6fdb2-078d-43dd-867d-d531abeda793",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041904/2_v4g3je.jpg",
    imagePublicId: "2_v4g3je",
  },
  {
    title: "Aksesoris Resmi Persija Laris di Kalangan Anak Muda",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Produk aksesoris Persija terus berkembang seiring meningkatnya antusiasme pasar suporter.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Bagi pendukung di Jakarta, membeli merch resmi bisa menjadi bentuk dukungan sederhana namun bermakna bagi klub.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. The Jak Mania sering menjadikan merch Persija sebagai simbol kebersamaan dan kebanggaan terhadap warna klub.`,
    category: "MERCH",
    authorId: "ac260dbf-4b19-419c-b97f-a47a63111799",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041904/3_ok8siu.jpg",
    imagePublicId: "3_ok8siu",
  },
  {
    title: "Persija Amankan Tiga Poin Penting di Jakarta",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Tiga poin di kandang selalu punya arti besar bagi Persija dalam menjaga posisi di klasemen.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Bermain di Jakarta memberi keuntungan emosional bagi Persija karena dukungan The Jak Mania bisa mengubah suasana pertandingan.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Dalam persaingan bola Indonesia, kemenangan kandang sering jadi fondasi paling penting untuk menjaga stabilitas musim.`,
    category: "MATCH",
    authorId: "33907d31-bda4-4dd6-98f7-347dfdce4e3c",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/4_pqhtg6.jpg",
    imagePublicId: "4_pqhtg6",
  },
  {
    title: "Bek Persija Ini Dapat Pujian Berkat Permainan Solid",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Pemain belakang Persija yang tampil tenang biasanya langsung mendapat perhatian dari pengamat bola Indonesia.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Bermain untuk Persija Jakarta menuntut keberanian duel, fokus penuh, dan kemampuan membaca arah permainan lawan.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Jika konsisten, pemain seperti ini bisa jadi figur penting yang dicintai The Jak Mania dalam waktu lama.`,
    category: "PLAYER",
    authorId: "5dc6fdb2-078d-43dd-867d-d531abeda793",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/5_fltbwc.jpg",
    imagePublicId: "5_fltbwc",
  },
  {
    title: "Persija Masih Pantau Beberapa Nama untuk Bursa Transfer",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Aktivitas transfer Persija selalu menarik karena klub ini identik dengan ekspektasi besar dan target tinggi.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Dalam kompetisi bola Indonesia, perekrutan pemain yang tepat bisa menjadi pembeda antara musim biasa dan musim yang kompetitif.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Publik Jakarta biasanya cepat bereaksi terhadap rumor transfer, terutama jika nama yang muncul dinilai cocok untuk kebutuhan Persija.`,
    category: "TRANSFER",
    authorId: "ac260dbf-4b19-419c-b97f-a47a63111799",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/1_nquybp.jpg",
    imagePublicId: "1_nquybp",
  },
  {
    title: "Persija Jadi Sorotan Setelah Performa Membaik",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Performa yang mulai naik membuat Persija kembali dibicarakan luas oleh penikmat bola Indonesia.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Klub asal Jakarta ini terlihat lebih kompak, lebih disiplin, dan punya transisi yang lebih rapi dibanding beberapa pekan sebelumnya.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Ketika tren positif datang, The Jak Mania biasanya ikut memompa optimisme bahwa Persija bisa menjaga momentum lebih lama.`,
    category: "NEWS",
    authorId: "33907d31-bda4-4dd6-98f7-347dfdce4e3c",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041904/2_v4g3je.jpg",
    imagePublicId: "2_v4g3je",
  },
  {
    title: "The Jak Mania Tetap Jadi Identitas Kuat Persija",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Tidak banyak klub di bola Indonesia yang punya relasi emosional sekuat Persija dan The Jak Mania.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Dukungan yang lahir dari Jakarta ini berkembang menjadi identitas kolektif yang dikenali luas di mana-mana.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Selama Persija berdiri, peran The Jak Mania akan terus menjadi bagian penting dalam setiap cerita klub.`,
    category: "FANS",
    authorId: "5dc6fdb2-078d-43dd-867d-d531abeda793",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041904/3_ok8siu.jpg",
    imagePublicId: "3_ok8siu",
  },
  {
    title: "Sejarah Rivalitas Persija Selalu Menarik Dibahas",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Rivalitas merupakan bagian tak terpisahkan dari sejarah panjang Persija dalam sepak bola Indonesia.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Sebagai klub besar dari Jakarta, Persija membawa beban sejarah dan ekspektasi yang selalu tinggi dalam tiap laga penting.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Bagi The Jak Mania, cerita rivalitas bukan cuma urusan hasil, tapi juga soal harga diri, tradisi, dan kebanggaan terhadap klub.`,
    category: "HISTORY",
    authorId: "ac260dbf-4b19-419c-b97f-a47a63111799",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/4_pqhtg6.jpg",
    imagePublicId: "4_pqhtg6",
  },
  {
    title: "Persija Kembali Matangkan Taktik Lewat Sesi Latihan Tertutup",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Sesi tertutup sering dipilih Persija untuk mematangkan detail taktik sebelum menghadapi laga penting.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Dalam persaingan bola Indonesia, persiapan teknis yang rapi kerap jadi pembeda saat kualitas antartim tidak terlalu jauh.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Persija Jakarta membutuhkan struktur latihan yang jelas agar pendekatan bermain mereka tidak mudah dibaca lawan.`,
    category: "TRAINING",
    authorId: "33907d31-bda4-4dd6-98f7-347dfdce4e3c",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/5_fltbwc.jpg",
    imagePublicId: "5_fltbwc",
  },
  {
    title: "Event Persija di Jakarta Diserbu Pendukung Setia",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Agenda event Persija sering sukses menarik antusiasme besar dari warga Jakarta dan pecinta bola Indonesia.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Kehadiran pemain, legenda klub, dan komunitas The Jak Mania membuat suasana event terasa lebih hangat dan penuh identitas.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Aktivasi semacam ini membantu Persija menjaga kedekatan emosional dengan suporternya di luar stadion.`,
    category: "EVENT",
    authorId: "5dc6fdb2-078d-43dd-867d-d531abeda793",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041903/1_nquybp.jpg",
    imagePublicId: "1_nquybp",
  },
  {
    title: "Produk Merchandise Persija Jadi Simbol Loyalitas Fans",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage. Merchandise Persija punya posisi unik karena sering dipakai untuk menunjukkan identitas dan rasa memiliki.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form. Dari produk sederhana sampai koleksi eksklusif, semua punya tempat tersendiri di hati pendukung Persija Jakarta.

There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words. Dalam budaya The Jak Mania, memakai merch klub sering terasa seperti membawa kebanggaan Jakarta ke mana pun pergi.`,
    category: "MERCH",
    authorId: "ac260dbf-4b19-419c-b97f-a47a63111799",
    image:
      "https://res.cloudinary.com/dhjorpzhh/image/upload/v1774041904/2_v4g3je.jpg",
    imagePublicId: "2_v4g3je",
  },
];
