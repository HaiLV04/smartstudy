export interface GameInfo {
  id: string;
  title: string;
  category: string;
  emoji: string;
  desc: string;
  is3D?: boolean;
  href: string;
  badge?: string;
}

export const ALL_GAMES: GameInfo[] = [
  // 3D Next.js Enhanced Games
  {
    id: "vong-quay-3d",
    title: "Vòng Quay May Mắn 3D",
    category: "3d",
    emoji: "🎡",
    desc: "Vòng quay vật lý 3D chân thực, xoay mượt mà, chọn học sinh và nạp đề trắc nghiệm lớp 1 - 5 tức thì.",
    is3D: true,
    href: "/games/vong-quay-3d",
    badge: "3D Physics"
  },
  {
    id: "dua-vit-3d",
    title: "Đua Vịt Tri Thức 3D",
    category: "3d",
    emoji: "🦆",
    desc: "4 chú vịt 3D bơi đua trên dòng sông uốn lượn — trả lời đúng để tiến về vạch đích.",
    is3D: true,
    href: "/games/dua-vit-3d",
    badge: "3D Water"
  },
  {
    id: "keo-co-3d",
    title: "Kéo Co Tri Thức 3D",
    category: "3d",
    emoji: "🪢",
    desc: "Đấu trường kéo co 3D giữa hai đội Đỏ và Xanh, lực kéo co phụ thuộc vào câu trả lời đúng.",
    is3D: true,
    href: "/games/keo-co-3d",
    badge: "3D Arena"
  },
  {
    id: "ngan-hang-de-3d",
    title: "Ngân Hàng Bộ Đề Lớp 1 - 5",
    category: "3d",
    emoji: "📚",
    desc: "Tổng hợp hàng trăm câu hỏi trắc nghiệm Toán, Tiếng Việt, Khoa học, Lịch sử - Địa lý, Tiếng Anh.",
    is3D: true,
    href: "/games/ngan-hang-de",
    badge: "Chuẩn CT 2018"
  },

  // Cổ điển & ngẫu nhiên
  {
    id: "vong-quay",
    title: "Vòng Quay May Mắn (Bản gốc)",
    category: "classic",
    emoji: "🎡",
    desc: "Quay vòng quay để chọn ngẫu nhiên học sinh trả lời câu hỏi trắc nghiệm.",
    href: "/games/vong-quay-3d"
  },
  {
    id: "dua-vit",
    title: "Đua Vịt Truyền Thống",
    category: "classic",
    emoji: "🦆",
    desc: "Những chú vịt bơi đua trên sông — vịt về đích đầu tiên sẽ đại diện trả lời.",
    href: "/games/dua-vit-3d"
  },
  {
    id: "keo-co",
    title: "Kéo Co Tri Thức",
    category: "classic",
    emoji: "🪢",
    desc: "Hai đội thi trả lời câu hỏi, mỗi câu đúng sẽ kéo được sợi dây về phía đội mình.",
    href: "/games/keo-co-3d"
  },
  {
    id: "dua-ngoi-sao",
    title: "Đua Ngôi Sao",
    category: "classic",
    emoji: "⭐",
    desc: "Hai đội đua trên đường đua, trả lời đúng để tiến về đích trước đối thủ.",
    href: "/games/dua-vit-3d"
  },
  {
    id: "ong-kinh-may-man",
    title: "Ống Kính May Mắn",
    category: "classic",
    emoji: "📷",
    desc: "Camera trang trí vui nhộn kết hợp chọn ngẫu nhiên học sinh trả lời câu hỏi.",
    href: "/games/vong-quay-3d"
  },

  // Arcade phản xạ
  {
    id: "chem-hoa-qua",
    title: "Chém Hoa Quả Tri Thức",
    category: "arcade",
    emoji: "🍉",
    desc: "Đáp án bay dạng hoa quả — nhấn/chạm để chém đáp án đúng trước khi hết giờ.",
    href: "/games/vong-quay-3d"
  },
  {
    id: "do-min",
    title: "Dò Mìn Tri Thức",
    category: "arcade",
    emoji: "💣",
    desc: "Chọn ô chứa đáp án đúng để vượt qua bãi mìn — 3 mạng, bước nhầm là nổ tung.",
    href: "/games/vong-quay-3d"
  },
  {
    id: "dap-chuot",
    title: "Đập Chuột Tri Thức",
    category: "arcade",
    emoji: "🔨",
    desc: "Chuột mang đáp án bất ngờ thò lên khỏi hang — đập đúng chuột trước khi nó lẩn mất.",
    href: "/games/vong-quay-3d"
  },
  {
    id: "bong-ro",
    title: "Bóng Rổ Tri Thức",
    category: "arcade",
    emoji: "🏀",
    desc: "Ném bóng vào rổ mang đáp án đúng — swish ăn điểm, trượt thì lộ đáp án.",
    href: "/games/vong-quay-3d"
  },
  {
    id: "phi-tieu",
    title: "Ném Phi Tiêu Tri Thức",
    category: "arcade",
    emoji: "🎯",
    desc: "Ném phi tiêu trúng vùng chứa đáp án đúng trên bảng phi tiêu đầy màu sắc.",
    href: "/games/vong-quay-3d"
  },
  {
    id: "cau-ca",
    title: "Câu Cá Tri Thức",
    category: "arcade",
    emoji: "🎣",
    desc: "Đàn cá tung tăng bơi qua màn hình — câu đúng con cá mang đáp án chính xác.",
    href: "/games/vong-quay-3d"
  },
  {
    id: "bong-bong",
    title: "Bong Bóng Xà Phòng",
    category: "arcade",
    emoji: "🫧",
    desc: "Bong bóng mang đáp án bay lên — chạm vỡ đúng bong bóng trước khi chúng bay mất.",
    href: "/games/vong-quay-3d"
  },
  {
    id: "slot-may-man",
    title: "Slot May Mắn",
    category: "arcade",
    emoji: "🎰",
    desc: "Quay máy xèng may mắn, chọn đúng ô đáp án để trúng thưởng Jackpot!",
    href: "/games/vong-quay-3d"
  },

  // Gameshow
  {
    id: "rung-chuong-vang",
    title: "Rung Chuông Vàng",
    category: "gameshow",
    emoji: "🔔",
    desc: "Thử thách loại trực tiếp cho cả lớp — ai trụ lại đến câu cuối cùng sẽ rung chuông vàng.",
    href: "/games/vong-quay-3d"
  },
  {
    id: "ai-la-trieu-phu",
    title: "Ai Là Triệu Phú",
    category: "gameshow",
    emoji: "💰",
    desc: "Leo từng bậc thang câu hỏi với 3 quyền trợ giúp: 50:50, gọi điện, hỏi ý kiến khán giả.",
    href: "/games/vong-quay-3d"
  },

  // Ghép nối & Giải đố
  {
    id: "the-lat",
    title: "Thẻ Lật Flashcard",
    category: "puzzle",
    emoji: "🃏",
    desc: "Tạo bộ thẻ ghi nhớ, lật thẻ để ôn bài, tự đánh giá đã thuộc hay chưa.",
    href: "/games/ngan-hang-de"
  },
  {
    id: "ghep-cap",
    title: "Ghép Cặp Trí Nhớ",
    category: "puzzle",
    emoji: "🧩",
    desc: "Lật 2 thẻ mỗi lượt để tìm cặp tương ứng — trò chơi rèn luyện trí nhớ kinh điển.",
    href: "/games/vong-quay-3d"
  },
  {
    id: "me-cung",
    title: "Mê Cung Tri Thức",
    category: "puzzle",
    emoji: "🌀",
    desc: "Trả lời đúng để mở đường, dẫn lối nhân vật vượt mê cung tìm đến đích.",
    href: "/games/vong-quay-3d"
  },
  {
    id: "so-do-tu-duy",
    title: "Sơ Đồ Tư Duy (Mindmap)",
    category: "builder",
    emoji: "🧠",
    desc: "Giáo viên dựng khung sơ đồ, học sinh cùng mở dần các nhánh để hoàn thiện.",
    href: "/games/ngan-hang-de"
  }
];
