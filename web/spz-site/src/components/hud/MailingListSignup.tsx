'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { trackNewsletterSignup } from '@/lib/analytics';
import { Send, Loader2, Radio } from 'lucide-react';

const schema = z.object({
  email: z.string().email({ message: 'Invalid signal address.' }),
  name: z.string().min(1, { message: 'Handle required.' }),
});

type FormValues = z.infer<typeof schema>;

export function MailingListSignup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/mailing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source: 'footer' }),
      });
      if (!res.ok) throw new Error('Subscription failed');
      trackNewsletterSignup();
      setSubscribed(true);
      reset();
      toast({
        title: 'FREQUENCY_LOCKED',
        description: 'You are now on the transmission list. Stand by.',
      });
    } catch {
      toast({
        title: 'SIGNAL_LOST',
        description: 'Could not complete subscription. Try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full border-t border-b border-cyber-cyan/15 py-10 mb-10">
      <div className="max-w-2xl mx-auto text-center space-y-5">
        <div className="flex items-center justify-center gap-2 text-cyber-cyan font-headline text-[10px] tracking-[0.3em] uppercase">
          <Radio size={11} className="animate-pulse" />
          OPEN_TRANSMISSION // JOIN_THE_FREQUENCY
        </div>

        <p className="font-mono text-xs text-white/40 leading-relaxed">
          Dispatches on AI, enterprise insurgency, and the outer edge — direct to your inbox. No algorithms. No noise.
        </p>

        {subscribed ? (
          <div className="flex items-center justify-center gap-3 py-4 border border-cyber-cyan/30 bg-cyber-cyan/5 px-6">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
            <span className="font-headline text-[11px] tracking-widest text-cyber-cyan uppercase">
              Transmission Confirmed — You&apos;re on the list
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
            <div className="flex-1 space-y-1">
              <input
                {...register('name')}
                placeholder="HANDLE / NAME"
                className="w-full bg-white/5 border border-cyber-cyan/20 focus:border-cyber-cyan outline-none px-4 py-3 text-white font-mono text-xs tracking-wider placeholder:text-white/20 transition-colors"
              />
              {errors.name && (
                <p className="text-cyber-magenta font-mono text-[10px] text-left">{errors.name.message}</p>
              )}
            </div>
            <div className="flex-[1.5] space-y-1">
              <input
                {...register('email')}
                type="email"
                placeholder="SIGNAL_EMAIL@DOMAIN"
                className="w-full bg-white/5 border border-cyber-cyan/20 focus:border-cyber-cyan outline-none px-4 py-3 text-white font-mono text-xs tracking-wider placeholder:text-white/20 transition-colors"
              />
              {errors.email && (
                <p className="text-cyber-magenta font-mono text-[10px] text-left">{errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-cyber-cyan text-black font-headline text-[10px] tracking-widest uppercase hover:bg-cyber-cyan/80 transition-colors disabled:opacity-50 shrink-0"
            >
              {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              {isSubmitting ? 'LOCKING...' : 'SUBSCRIBE'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
