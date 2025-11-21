import React, { useEffect, useState, useCallback, useRef } from 'react';
import Drawer from '@/app/components/ui/Drawer/Drawer';
import Input from '@/app/components/ui/Input/Input';
import Button from '@/app/components/ui/Button/Button';
import { TbCircleDashed, TbCircleDashedCheck, TbChevronDown, TbRocket, TbPlus } from 'react-icons/tb';
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

interface CreateLinkDrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function CreateLinkDrawer({ open, onClose }: CreateLinkDrawerProps) {
    const { createLink } = useLinks();
    const { createRule } = useLinkRules();
    const { isAuthenticated } = useAuth();
    const toast = useToast();
    const [statusBar, setShowStatusBar] = useState("none");
    const [newLink, setNewLink] = useState({
        longUrl: '',
        status: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showRules, setShowRules] = useState(false);
    const [localRules, setLocalRules] = useState<LinkRuleType[]>([]);

    // Ref for animated text
    const statusButtonTextRef = useRef<AnimatedTextRef>(null);

    const limits = isAuthenticated ? PLAN_LIMITS.user : PLAN_LIMITS.guest;

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
            toast.error('Long URL is required');
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
                        toast.error('Link created but some rules failed', {
                            showIcon: false,
                            description: 'Some rules could not be created.',
                        });
                    }
                }
            }

            toast.success('Link created successfully!', {
                showIcon: false,
            });

            setNewLink({
                longUrl: '',
                status: true,
            });
            setLocalRules([]);
            setShowRules(false);
            onClose();
        } else {
            if (response.errorCode === 'LINK_LIMIT_EXCEEDED') {
                toast.error('Error creating link', {
                    showIcon: false,
                    description: 'You\'ve reached your link limit. Upgrade your plan to create more links.',
                    duration: 6000,
                });
            } else if (response.errorCode === 'UNAUTHORIZED') {
                toast.error('Error creating link', {
                    showIcon: false,
                    description: 'Please login again to continue.',
                });
            } else if (response.errorCode === 'INVALID_DATA') {
                toast.error('Error creating link', {
                    showIcon: false,
                    description: 'Please check your input and try again.',
                });
            } else {
                toast.error('Error creating link', {
                    showIcon: false,
                    description: 'An unexpected error occurred.',
                });
            }

            setError('Error creating link');
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
            actionSettings: { url: '{{longUrl}}' },
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

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = async (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey && newLink.longUrl.trim()) {
                e.preventDefault();
                setShowStatusBar("loading");
                await handleCreateLink();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, newLink.longUrl, handleCreateLink]);

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
                        Create a new link
                    </motion.p>
                </div>

                {/* Status */}
                <div className='w-full flex flex-col md:flex-row items-start md:items-center gap-1'>
                    <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05, duration: 0.4, ease: "backInOut" }}
                        className='text-lg font-black italic'>
                        Status
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
                            className={`${newLink.status ? 'bg-success text-dark' : 'bg-danger text-light'}`}
                            onClick={() => {
                                statusButtonTextRef.current?.setText(newLink.status ? 'Inactive' : 'Active');
                                setNewLink({ ...newLink, status: !newLink.status })
                            }}
                        >
                            <AnimatedText
                                ref={statusButtonTextRef}
                                initialText={newLink.status ? 'Active' : 'Inactive'}
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
                        Long URL <span className='text-danger'>*</span>
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.4, ease: "backInOut" }}
                        className='relative flex items-center gap-1'
                    >
                        <Input
                            value={newLink.longUrl}
                            onChange={(e) => {setNewLink({ ...newLink, longUrl: e.target.value }); setShowStatusBar("confirm")}}
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter' && !e.shiftKey && newLink.longUrl.trim()) {
                                    e.preventDefault();
                                    setShowStatusBar("loading");
                                    await handleCreateLink();
                                }
                            }}
                            placeholder='https://example.com'
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
                    <div className="space-y-2">
                        {/* Collapsible Header */}
                        <button
                            onClick={() => setShowRules(!showRules)}
                            className='w-full flex items-center justify-between p-3 rounded-2xl border border-dark/10 hover:border-dark/20 hover:bg-dark/5 transition-all'
                        >
                            <div className='flex items-center gap-2'>
                                <TbRocket size={20} />
                                <span className='font-black italic'>Link Rules</span>
                                <span className='text-xs text-dark/50'>
                                    ({localRules.length}/{limits.rulesPerLink})
                                </span>
                            </div>
                            <motion.div
                                animate={{ rotate: showRules ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TbChevronDown size={20} />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {showRules && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -20, scale: 0.9 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0, scale: 1 }}
                                    exit={{ opacity: 0, height: 0, y: -20, scale: 0.9 }}
                                    transition={{
                                        duration: 0.5,
                                        ease: [0.34, 1.56, 0.64, 1],
                                        height: { duration: 0.4 }
                                    }}
                                    className='overflow-hidden'
                                >
                                    <div className='space-y-4 mt-4'>
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
                                                    disabled={localRules.length >= limits.rulesPerLink}
                                                    className='bg-primary text-dark hover:bg-primary hover:shadow-[4px_4px_0_var(--color-dark)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none'
                                                    title={localRules.length >= limits.rulesPerLink ? `Maximum ${limits.rulesPerLink} ${limits.rulesPerLink === 1 ? 'rule' : 'rules'} allowed` : ''}
                                                >
                                                    Add Rule
                                                </Button>
                                                <p className='text-xs text-dark/50 text-center'>
                                                    Rules are evaluated in order from top to bottom
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
                                                    Create Your First Rule
                                                </Button>
                                                <p className='text-xs text-dark/50 text-center'>
                                                    Rules are evaluated in order from top to bottom
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                                        {statusBar === "loading" ? "Creating Link" : "Ready to Create"}
                                    </p>
                                    <p className='text-sm text-dark/70'>
                                        {statusBar === "loading" ? "Please wait while we create your link..." : "Click 'Create Link' to proceed"}
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
                                        Cancel
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
                                        Create Link
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
                                        Creating...
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