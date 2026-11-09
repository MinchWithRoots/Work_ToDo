import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-sm font-semibold text-primary">Ошибка 404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Страница не найдена
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        Возможно, ссылка устарела или адрес введён с ошибкой.
      </p>
      <Link
        to="/"
        className={cn(buttonVariants({ size: "lg" }), "mt-8 rounded-2xl")}
      >
        Вернуться к задачам
      </Link>
    </div>
  );
}
