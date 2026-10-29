import { useTranslations } from 'next-intl';
import * as motion from 'motion/react-client';
import { TbCategory, TbPuzzle, TbList, TbPalette, TbShare2 } from 'react-icons/tb';
import Button from '../ui/Button/Button';

interface LinkDrawerTabsProps {
    tab: string;
    onChange: (tab: string) => void;
    isGuest: boolean;
}

export default function LinkDrawerTabs({ tab, onChange: setTab, isGuest }: LinkDrawerTabsProps) {
    const t = useTranslations('EditLinkDrawer');

    return (
        <div className='bg-light w-5/6 flex gap-2 pl-4 pr-10 pt-4 pb-0 overflow-x-auto scrollbar-hide flex-shrink-0' style={{ maskImage: 'linear-gradient(to right, black calc(100% - 2.5rem), transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 2.5rem), transparent 100%)' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "backInOut" }} className="flex-shrink-0">
                <Button variant='ghost' size='sm' rounded='2xl' leftIcon={<TbCategory size={20} />}
                    className={`rounded-2xl ${tab === 'overview' ? 'bg-dark text-light hover:bg-dark/90' : 'bg-dark/5 text-dark/50'}`}
                    onClick={() => setTab('overview')}
                >
                    {t('tabOverview')}
                </Button>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4, ease: "backInOut" }} className="flex-shrink-0">
                <Button variant='ghost' size='sm' rounded='2xl' leftIcon={<TbPuzzle size={20} />}
                    className={`rounded-2xl ${tab === 'rules' ? 'bg-dark text-light hover:bg-dark/90' : 'bg-dark/5 text-dark/50'}`}
                    onClick={() => setTab('rules')}
                >
                    {t('tabRules')}
                </Button>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }} className="flex-shrink-0">
                <Button variant='ghost' size='sm' rounded='2xl' leftIcon={<TbList size={20} />}
                    className={`rounded-2xl ${tab === 'history' ? 'bg-dark text-light hover:bg-dark/90' : 'bg-dark/5 text-dark/50'}`}
                    onClick={() => setTab('history')}
                    disabled={isGuest}
                >
                    {t('tabHistory')}
                </Button>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4, ease: "backInOut" }} className="flex-shrink-0">
                <Button variant='ghost' size='sm' rounded='2xl' leftIcon={<TbPalette size={20} />}
                    className={`rounded-2xl ${tab === 'qr' ? 'bg-dark text-light hover:bg-dark/90' : 'bg-dark/5 text-dark/50'}`}
                    onClick={() => setTab('qr')}
                    disabled={isGuest}
                >
                    {t('tabQR')}
                </Button>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4, ease: "backInOut" }} className="flex-shrink-0">
                <Button variant='ghost' size='sm' rounded='2xl' leftIcon={<TbShare2 size={20} />}
                    className={`rounded-2xl ${tab === 'metadata' ? 'bg-dark text-light hover:bg-dark/90' : 'bg-dark/5 text-dark/50'}`}
                    onClick={() => setTab('metadata')}
                    disabled={isGuest}
                >
                    {t('tabMetadata')}
                </Button>
            </motion.div>
        </div>
    );
}
