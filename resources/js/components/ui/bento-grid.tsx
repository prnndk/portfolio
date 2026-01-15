import { cn } from "@/lib/utils";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
    proficiency,
    category,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    proficiency?: string;
    category?: string;
}) => {
    return (
        <div
            className={cn(
                "rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4 h-full",
                className
            )}
        >
            <div className="flex flex-1 flex-col justify-center items-center h-full min-h-[4rem]">
                {header}
            </div>
            <div className="group-hover/bento:translate-x-2 transition duration-200">
                <div className="flex items-center justify-between mb-2">
                    {icon}
                    {category && (
                        <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-secondary rounded-full">
                            {category}
                        </span>
                    )}
                </div>
                <div className="font-heading font-bold text-neutral-600 dark:text-neutral-200 mb-1">
                    {title}
                </div>
                <div className="flex items-center justify-between">
                    <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
                        {description}
                    </div>
                    {proficiency && (
                        <div className="text-xs font-bold text-primary">
                            {proficiency}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
