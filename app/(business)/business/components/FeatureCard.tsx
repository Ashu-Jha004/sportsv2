"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, type LucideIcon } from "lucide-react";

interface Feature {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  gradient: string;
  badgeText: string;
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

export default function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 group">
        {/* Image Section with Gradient Overlay */}
        <div className="relative h-56 overflow-hidden">
          <Image
            src={feature.image}
            alt={feature.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            quality={80}
          />

          {/* Gradient Overlay */}
          <div
            className={`absolute inset-0 bg-linear-to-t ${feature.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
          />

          {/* Badge */}
          <div className="absolute top-4 right-4">
            <Badge
              className={`bg-linear-to-r ${feature.gradient} text-white border-none shadow-lg`}
            >
              {feature.badgeText}
            </Badge>
          </div>

          {/* Icon */}
          <div className="absolute bottom-4 left-4">
            <div
              className={`p-3 rounded-xl bg-white dark:bg-slate-900 shadow-lg backdrop-blur-sm`}
            >
              <Icon
                className={`w-6 h-6 bg-linear-to-r ${feature.gradient} bg-clip-text text-transparent`}
                strokeWidth={2.5}
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white group-hover:bg-linear-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
            {feature.title}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {feature.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="grow">
          <ul className="space-y-3">
            {feature.features.map((item, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + idx * 0.05 }}
                className="flex items-start gap-3"
              >
                <div
                  className={`mt-0.5 p-1 rounded-full bg-linear-to-r ${feature.gradient}shrink-0`}
                >
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {item}
                </span>
              </motion.li>
            ))}
          </ul>
        </CardContent>

        {/* Footer with CTA */}
        <CardFooter className="pt-6">
          <Button asChild className="w-full group/btn" size="lg">
            <Link
              href={feature.ctaLink}
              className={`bg-linear-to-r ${feature.gradient} hover:opacity-90 transition-all duration-300`}
            >
              {feature.ctaText}
              <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
