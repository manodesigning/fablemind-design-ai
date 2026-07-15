import clsx from 'clsx';

function getInitials(name = '', email = '') {
  if (name?.trim()) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email ? email[0].toUpperCase() : 'U';
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
};

export function Avatar({ user, size = 'md', className }) {
  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName || 'User avatar'}
        className={clsx('rounded-full object-cover shrink-0', sizes[size], className)}
      />
    );
  }

  return (
    <div className={clsx(
      'rounded-full shrink-0 flex items-center justify-center font-semibold',
      'bg-gradient-to-br from-primary to-accent text-white',
      sizes[size], className,
    )}>
      {getInitials(user?.displayName, user?.email)}
    </div>
  );
}

export function AIAvatar({ size = 'md', className }) {
  return (
    <div className={clsx(
      'rounded-full shrink-0 flex items-center justify-center font-bold',
      'bg-gradient-to-br from-primary via-accent to-purple-400 text-white shadow-lg shadow-primary/30',
      sizes[size], className,
    )}>
      F
    </div>
  );
}
