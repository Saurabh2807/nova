export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 768 768" className={className} fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M 331 202 L 308 216 L 307 275 L 288 227 L 203 278 L 203 306 L 155 340 L 155 426 L 203 461 L 203 491 L 302 550 L 303 517 L 370 592 L 370 607 L 368 608 L 188 501 L 188 470 L 156 446 L 155 522 L 384 656 L 611 523 L 612 445 L 579 470 L 579 501 L 398 608 L 397 582 L 434 536 L 435 568 L 465 551 L 465 456 L 562 393 L 563 360 L 435 281 L 435 365 L 521 366 L 497 403 L 435 403 L 435 502 L 399 545 L 397 544 L 397 416 L 370 444 L 370 544 L 368 545 L 329 496 L 266 335 L 265 488 L 188 405 L 188 354 L 201 344 L 203 345 L 203 399 L 229 427 L 229 297 L 278 268 L 332 403 Z M 155 245 L 155 321 L 188 297 L 188 269 L 369 162 L 370 394 L 397 366 L 397 215 L 399 214 L 537 298 L 537 324 L 579 353 L 579 417 L 498 470 L 498 531 L 562 493 L 563 462 L 612 426 L 612 341 L 564 306 L 564 278 L 397 179 L 397 163 L 399 162 L 576 266 L 580 270 L 579 297 L 612 321 L 612 245 L 384 111 Z"
      />
    </svg>
  );
}

export function LogoLockup({
  className = "",
  markClassName = "h-9 w-9 text-nf-navy",
  wordmarkClassName = "text-nf-ink",
}: {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={markClassName} />
      <span className={`font-display font-bold leading-none tracking-tight ${wordmarkClassName}`}>
        <span className="block text-[0.95rem]">NOVA FORGE</span>
        <span className="block text-[0.55rem] font-medium tracking-[0.25em] opacity-60">
          ESPORTS
        </span>
      </span>
    </span>
  );
}
