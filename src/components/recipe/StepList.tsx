interface StepListProps {
  steps: string[];
}

// The steps, like Gladkokken: a 50×50 (3.125rem) gold square with the number in serif, a dotted line,
// then the text below in a large, airy size, so you can find your place again while cooking.
function StepList({ steps }: StepListProps) {
  return (
    // <ol> already tells screen readers the numbers, so the visible squares are aria-hidden
    <ol className="space-y-12">
      {steps.map((step, index) => (
        <li key={index}>
          <div aria-hidden="true" className="flex items-center gap-5">
            <span className="flex h-[3.125rem] w-[3.125rem] shrink-0 items-center justify-center bg-gold font-serif text-[2.125rem] font-semibold leading-none text-white">
              {index + 1}
            </span>
            <span className="flex-1 border-t-[3px] border-dotted border-gold/50" />
          </div>
          {/* 16/24 on phones, 18/32 on desktop: the same sizes as Gladkokken */}
          <p className="mt-5 text-base leading-6 lg:text-lg lg:leading-8">
            {step}
          </p>
        </li>
      ))}
    </ol>
  );
}

export default StepList;
