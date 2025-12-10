export function ProductCardSkeleton() {
  return (
    <div className="bg-warm-cream rounded-3xl shadow-xl overflow-hidden animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
        {/* Image skeleton */}
        <div className="relative h-96 bg-tea-brown/20 rounded-2xl"></div>

        {/* Content skeleton */}
        <div className="space-y-6">
          {/* Title */}
          <div className="h-10 bg-tea-brown/20 rounded-lg w-3/4"></div>
          
          {/* Description lines */}
          <div className="space-y-3">
            <div className="h-4 bg-tea-brown/20 rounded w-full"></div>
            <div className="h-4 bg-tea-brown/20 rounded w-5/6"></div>
            <div className="h-4 bg-tea-brown/20 rounded w-4/6"></div>
          </div>

          {/* Price */}
          <div className="h-12 bg-tea-brown/20 rounded-lg w-1/2"></div>

          {/* Stock status */}
          <div className="h-6 bg-tea-brown/20 rounded w-1/3"></div>

          {/* Quantity selector */}
          <div className="flex gap-4">
            <div className="h-14 bg-tea-brown/20 rounded-xl w-32"></div>
            <div className="h-14 bg-tea-brown/20 rounded-full flex-1"></div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <div className="h-14 bg-tea-brown/20 rounded-full flex-1"></div>
            <div className="h-14 bg-tea-brown/20 rounded-full flex-1"></div>
          </div>

          {/* Features */}
          <div className="space-y-3 pt-6 border-t-2 border-tea-brown/10">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-tea-brown/20 rounded-full"></div>
              <div className="h-4 bg-tea-brown/20 rounded w-2/3"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-tea-brown/20 rounded-full"></div>
              <div className="h-4 bg-tea-brown/20 rounded w-3/4"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-tea-brown/20 rounded-full"></div>
              <div className="h-4 bg-tea-brown/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="flex items-center gap-6 py-6 border-b border-tea-brown/10 last:border-0 animate-pulse">
      {/* Image */}
      <div className="w-24 h-24 bg-tea-brown/20 rounded-xl flex-shrink-0"></div>

      {/* Content */}
      <div className="flex-1 space-y-3">
        <div className="h-6 bg-tea-brown/20 rounded w-2/3"></div>
        <div className="h-5 bg-tea-brown/20 rounded w-1/4"></div>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-tea-brown/20 rounded-lg"></div>
        <div className="w-12 h-10 bg-tea-brown/20 rounded"></div>
        <div className="w-10 h-10 bg-tea-brown/20 rounded-lg"></div>
      </div>

      {/* Price */}
      <div className="w-24 text-right">
        <div className="h-7 bg-tea-brown/20 rounded w-full"></div>
      </div>

      {/* Remove button */}
      <div className="w-10 h-10 bg-tea-brown/20 rounded-lg"></div>
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          <div className="h-6 bg-tea-brown/20 rounded w-32"></div>
          <div className="h-4 bg-tea-brown/20 rounded w-24"></div>
        </div>
        {/* Stars */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-5 h-5 bg-tea-brown/20 rounded"></div>
          ))}
        </div>
      </div>

      {/* Detailed ratings */}
      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-warm-cream/50 rounded-xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-tea-brown/20 rounded w-12 mx-auto"></div>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="w-4 h-4 bg-tea-brown/20 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <div className="h-4 bg-tea-brown/20 rounded w-full"></div>
        <div className="h-4 bg-tea-brown/20 rounded w-5/6"></div>
        <div className="h-4 bg-tea-brown/20 rounded w-4/6"></div>
      </div>
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-tea-brown/10">
        <div className="space-y-2">
          <div className="h-6 bg-tea-brown/20 rounded w-32"></div>
          <div className="h-4 bg-tea-brown/20 rounded w-24"></div>
        </div>
        <div className="h-8 bg-tea-brown/20 rounded-full w-24"></div>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-tea-brown/20 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-tea-brown/20 rounded w-3/4"></div>
            <div className="h-4 bg-tea-brown/20 rounded w-1/4"></div>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-tea-brown/10">
        <div className="h-8 bg-tea-brown/20 rounded w-1/3 ml-auto"></div>
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
      <div className="space-y-4">
        {/* Header */}
        <div className="h-6 bg-tea-brown/20 rounded w-1/3"></div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-12 bg-tea-brown/20 rounded w-full"></div>
              <div className="h-4 bg-tea-brown/20 rounded w-2/3 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="h-64 bg-tea-brown/20 rounded-lg mt-6"></div>
      </div>
    </div>
  );
}
