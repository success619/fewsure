import Image from "next/image";
import { Heart, MessageCircle, Edit, User } from "lucide-react";
import { Deal } from "@/types";
import Link from "next/link";

interface DealCardProps {
  deal: Deal;
  currentUserId: string;
}

export function DealCard({ deal, currentUserId }: DealCardProps) {
  // Safe top-level validation leveraging root database foreign key constraints
  const isOwner = deal.user_id === currentUserId;
  const authorName = deal.profiles?.full_name || "Anonymous Agent";
  const avatarUrl = deal.profiles?.avatar_url;

  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
      {/* Feed Header: Avatar and Name */}
      <div className="flex items-center justify-between p-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={authorName}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">{authorName}</h3>
        </div>

        {isOwner && (
          <Link href={`/dashboard/edit/${deal.id}`}>
            <button className="text-gray-400 hover:text-blue-600 transition">
              <Edit className="w-4 h-4" />
            </button>
          </Link>
        )}
      </div>

      {/* Multiple Images Support (Horizontal Scroll) */}
      {deal.image_urls && deal.image_urls.length > 0 && (
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar bg-gray-50">
          {deal.image_urls.map((imgUrl, idx) => (
            <div
              key={idx}
              className="min-w-full snap-center relative aspect-video"
            >
              <Image
                src={imgUrl}
                alt={`${deal.title} image ${idx + 1}`}
                fill
                sizes="(max-w-xl) 100vw, 576px"
                className="object-cover"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>
      )}

      {/* Post Content */}
      <div className="p-4">
        <h4 className="text-base font-bold text-gray-900 mb-1">{deal.title}</h4>
        <p className="text-xl font-extrabold text-blue-600 mb-2">
          ${deal.price.toLocaleString()}
        </p>
        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
          {deal.description}
        </p>
      </div>

      {/* Social Interactions */}
      <div className="px-4 py-2.5 border-t border-gray-50 flex gap-4">
        <button className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition group">
          <Heart className="w-4 h-4 group-hover:scale-110 transition" />
          <span className="text-xs font-medium">Like</span>
        </button>
        <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition group">
          <MessageCircle className="w-4 h-4 group-hover:scale-110 transition" />
          <span className="text-xs font-medium">Comment</span>
        </button>
      </div>
    </article>
  );
}
