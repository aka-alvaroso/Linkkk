import React, { useEffect, useState, useCallback, useRef } from 'react';
import Drawer from '@/app/components/ui/Drawer/Drawer';
import Input from '@/app/components/ui/Input/Input';
import Button from '@/app/components/ui/Button/Button';
import { TbCircleDashed, TbCircleDashedCheck, TbRocket, TbPlus } from 'react-icons/tb';
import { useLinks } from '@/app/hooks';
import { useToast } from '@/app/hooks/useToast';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { useLinkRules } from '@/app/hooks';
import { LinkRule as LinkRuleType, RuleCondition } from '@/app/types/linkRules';
import { LinkRule } from '../LinkRules/LinkRule';
import { useAuth } from '@/app/hooks';
import { PLAN_LIMITS } from '@/app/constants/limits';
import AnimatedText, { AnimatedTextRef } from '../ui/AnimatedText';
import { useTranslations } from 'next-intl';

interface CreateLinkDrawerProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateLinkDrawer({ open, onClose, onSuccess }: CreateLinkDrawerProps) {
    const t = useTranslations('CreateLinkDrawer');
    const { createLink } = useLinks();
    const { createRule } = useLinkRules();
    const { isAuthenticated, isGuest, user } = useAuth();
    const toast = useToast();
    const [statusBar, setShowStatusBar] = useState("none");
    const [newLink, setNewLink] = useState({
        longUrl: '',
        status: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [localRules, setLocalRules] = useState<LinkRuleType[]>([]);

    // Ref for animated text
    const statusButtonTextRef = useRef<AnimatedTextRef>(null);

    const limits = isGuest
        ? PLAN_LIMITS.guest
        : user?.role === 'PRO'
            ? PLAN_LIMITS.pro
            : PLAN_LIMITS.user;

    useEffect(() => {
        const hasChanges = newLink.longUrl !== '';
        if (hasChanges) {
            setShowStatusBar("confirm")
        } else {
            setShowStatusBar("none");
        }
    }, [newLink]);

    // Process conditions to convert country string to array and filter "always"
    const processConditions = (conditions: RuleCondition[]) => {
        return conditions
            .filter(condition => condition.field !== 'always')
            .map(condition => {
                if (condition.field === 'country' && typeof condition.value === 'string') {
                    const countries = condition.value
                        .split(',')
                        .map((c: string) => c.trim())
                        .filter((c: string) => c.length > 0);
                    return { ...condition, value: countries };
                }
                return condition;
            });
    };

    const handleCreateLink = useCallback(async () => {
        if (!newLink.longUrl) {
            toast.error(t('toastLongUrlRequired'));
            return;
        }

        setLoading(true);
        setError('');

        const response = await createLink({
            longUrl: newLink.longUrl,
            status: newLink.status,
        });

        if (response.success && response.data) {
            // Create rules if any exist
            if (localRules.length > 0) {
                for (const rule of localRules) {
                    try {
                        await createRule(response.data.shortUrl, {
                            priority: rule.priority,
                            enabled: rule.enabled,
                            match: rule.match,
                            conditions: processConditions(rule.conditions),
                            action: {
                                type: rule.actionType,
                                settings: rule.actionSettings
                            },
                            ...(rule.elseActionType && {
                                elseAction: {
                                    type: rule.elseActionType,
                                    settings: rule.elseActionSettings!
                                }
                            })
                        });
                    } catch (err) {
                        console.error('Error creating rule:', err);
                        toast.error(t('toastRulesFailed'), {
                            showIcon: false,
                            description: t('toastRulesFailedDesc'),
                        });
                    }
                }
            }

            toast.success(t('toastLinkCreated'), {
                showIcon: false,
            });

            setNewLink({
                longUrl: '',
                status: true,
            });
            setLocalRules([]);
            onClose();

            // Call onSuccess callback if provided (e.g., redirect to dashboard)
            if (onSuccess) {
                onSuccess();
            }
        } else {
            if (response.errorCode === 'LINK_LIMIT_EXCEEDED') {
                toast.error(t('toastErrorCreating'), {
                    showIcon: false,
                    description: t('toastLinkLimitExceeded'),
                    duration: 6000,
                });
            } else if (response.errorCode === 'UNAUTHORIZED') {
                toast.error(t('toastErrorCreating'), {
                    showIcon: false,
                    description: t('toastUnauthorized'),
                });
            } else if (response.errorCode === 'INVALID_DATA') {
                toast.error(t('toastErrorCreating'), {
                    showIcon: false,
                    description: t('toastInvalidData'),
                });
            } else {
                toast.error(t('toastErrorCreating'), {
                    showIcon: false,
                    description: t('toastUnexpectedError'),
                });
            }

            setError(t('toastErrorCreating'));
        }

        setLoading(false);
        setShowStatusBar("none");
    }, [createLink, createRule, newLink.longUrl, newLink.status, localRules, onClose, toast]);

    // Handle adding a new rule
    const handleAddRule = () => {
        const newRule: LinkRuleType = {
            id: Date.now(),
            priority: localRules.length,
            enabled: true,
            match: 'AND',
            conditions: [{ field: 'always', operator: 'equals', value: true }],
            actionType: 'redirect',
            actionSettings: { url: '' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setLocalRules([...localRules, newRule]);
    };

    // Handle rule change
    const handleRuleChange = (ruleId: number, updatedRule: LinkRuleType) => {
        setLocalRules(localRules.map(r => r.id === ruleId ? updatedRule : r));
    };

    // Handle rule delete
    const handleDeleteRule = (ruleId: number) => {
        setLocalRules(localRules.filter(r => r.id !== ruleId));
    };

    return (
        <Drawer
            open={open}
            onClose={onClose}
            modal
            placement='right'
            size='md'
            rounded='3xl'
            className='h-full overflow-hidden flex flex-col'
        >
            <div className='flex-1 overflow-auto flex flex-col gap-4 p-4 pb-32'>
                <div className='flex items-center'>
                    <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0, duration: 0.4, ease: "backInOut" }}
                        className='text-2xl md:text-3xl font-black italic w-full'>
                        {t('title')}
                    </motion.p>
                </div>

                {/* Status */}
                <div className='w-full flex flex-col md:flex-row items-start md:items-center gap-1'>
                    <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05, duration: 0.4, ease: "backInOut" }}
                        className='text-lg font-black italic'>
                        {t('status')}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }}
                    >
                        <Button
                            variant='solid'
                            size='sm'
                            rounded='xl'
                            leftIcon={newLink.status ? <TbCircleDashedCheck size={20} /> : <TbCircleDashed size={20} />}
                            className={`${newLink.status ? 'bg-primary text-dark' : 'bg-danger text-light'}`}
                            onClick={() => {
                                statusButtonTextRef.current?.setText(newLink.status ? t('inactive') : t('active'));
                                setNewLink({ ...newLink, status: !newLink.status })
                            }}
                        >
                            <AnimatedText
                                ref={statusButtonTextRef}
                                initialText={newLink.status ? t('active') : t('inactive')}
                                animationType="slide"
                                triggerMode='none'
                            />
                        </Button>
                    </motion.div>
                </div>

                {/* Long URL */}
                <div className='w-full flex flex-col md:flex-row items-start md:items-center gap-4'>
                    <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.4, ease: "backInOut" }}
                        className='text-lg font-black italic'>
                        {t('longUrl')} <span className='text-danger'>{t('required')}</span>
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.4, ease: "backInOut" }}
                        className='relative flex items-center gap-1'
                    >
                        <Input
                            value={newLink.longUrl}
                            onChange={(e) => { setNewLink({ ...newLink, longUrl: e.target.value }); setShowStatusBar("confirm") }}
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter' && !e.shiftKey && newLink.longUrl.trim()) {
                                    e.preventDefault();
                                    setShowStatusBar("loading");
                                    await handleCreateLink();
                                }
                            }}
                            placeholder={t('urlPlaceholder')}
                            size='md'
                            rounded='2xl'
                            className='w-full max-w-md'
                            autoFocus
                        />
                    </motion.div>
                </div>

                {/* Link Rules Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25, duration: 0.4, ease: "backInOut" }}
                    className='w-full'
                >
                    <div className="space-y-4">
                        {/* Header */}
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <TbRocket size={20} />
                                <span className='font-black italic'>{t('linkRules')}</span>
                                <span className='text-xs text-dark/50'>
                                    ({localRules.length}/{limits.rulesPerLink ?? '∞'})
                                </span>
                            </div>
                        </div>

                        {/* Rules List */}
                        {localRules.length > 0 ? (
                            <>
                                <div className="space-y-4">
                                    {localRules.map((rule, index) => (
                                        <div key={rule.id}>
                                            <LinkRule
                                                rule={rule}
                                                priority={index + 1}
                                                onChange={(updatedRule) => handleRuleChange(rule.id, updatedRule)}
                                                onDelete={() => handleDeleteRule(rule.id)}
                                                maxConditions={limits.conditionsPerRule}
                                                isExpanded={true}
                                                onToggleExpand={() => {}}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    variant="solid"
                                    size="md"
                                    rounded="2xl"
                                    leftIcon={<TbPlus size={20} />}
                                    onClick={handleAddRule}
                                    disabled={limits.rulesPerLink !== null && localRules.length >= limits.rulesPerLink}
                                    className='bg-primary text-dark hover:bg-primary hover:shadow-[4px_4px_0_var(--color-dark)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none'
                                    title={limits.rulesPerLink !== null && localRules.length >= limits.rulesPerLink ? t('maxRulesTitle', { count: limits.rulesPerLink, plural: limits.rulesPerLink === 1 ? t('rule') : t('rules') }) : ''}
                                >
                                    {t('addRule')}
                                </Button>
                                <p className='text-xs text-dark/50 text-center'>
                                    {t('rulesEvaluationNote')}
                                </p>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    rounded="2xl"
                                    leftIcon={<TbPlus size={20} />}
                                    onClick={handleAddRule}
                                    className='w-full bg-dark/5 hover:bg-dark/10'
                                >
                                    {t('createFirstRule')}
                                </Button>
                                <p className='text-xs text-dark/50 text-center'>
                                    {t('rulesEvaluationNote')}
                                </p>
                            </>
                        )}
                    </div>
                </motion.div>

            </div>

            {/* Status bar - Fixed at bottom */}
            <AnimatePresence>
                {statusBar !== 'none' && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ duration: 0.3, ease: "backOut" }}
                        className='w-full bg-dark/5 border-t p-4'
                    >
                        <div className='flex flex-col gap-3 max-w-4xl mx-auto'>
                            <div className='flex items-start gap-2'>
                                <div className='w-6 h-6 rounded-full bg-primary border flex items-center justify-center flex-shrink-0 mt-0.5'>
                                    <span className='text-dark text-sm font-bold'>
                                        <TbPlus size={14} />
                                    </span>
                                </div>
                                <div className='flex-1'>
                                    <p className='text-lg font-black italic text-dark mb-1'>
                                        {statusBar === "loading" ? t('creatingLink') : t('readyToCreate')}
                                    </p>
                                    <p className='text-sm text-dark/70'>
                                        {statusBar === "loading" ? t('creatingLinkDesc') : t('readyToCreateDesc')}
                                    </p>
                                </div>
                            </div>
                            {statusBar === "confirm" && (
                                <div className='flex gap-2 justify-end'>
                                    <Button
                                        variant='outline'
                                        size='md'
                                        rounded='2xl'
                                        className='border-dark/30'
                                        onClick={() => {
                                            setNewLink({
                                                longUrl: '',
                                                status: true,
                                            });
                                            setLocalRules([]);
                                            setShowStatusBar("none");
                                            onClose();
                                        }}
                                    >
                                        {t('cancel')}
                                    </Button>
                                    <Button
                                        variant='solid'
                                        size='md'
                                        rounded='2xl'
                                        className='bg-primary text-dark hover:shadow-[4px_4px_0_var(--color-dark)]'
                                        onClick={async () => {
                                            setShowStatusBar("loading");
                                            await handleCreateLink();
                                        }}
                                    >
                                        {t('createLink')}
                                    </Button>
                                </div>
                            )}
                            {statusBar === "loading" && (
                                <div className='flex gap-2 justify-end'>
                                    <Button
                                        variant='solid'
                                        size='md'
                                        rounded='2xl'
                                        className='bg-primary text-dark'
                                        loading={true}
                                        disabled
                                    >
                                        {t('creating')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Drawer>
    );
}