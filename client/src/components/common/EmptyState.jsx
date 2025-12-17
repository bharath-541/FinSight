import PropTypes from 'prop-types';
import { Link } from 'react-router';

export default function EmptyState({
    icon: Icon,
    title,
    description,
    actionText,
    actionLink,
    actionOnClick,
    secondaryActions = []
}) {
    return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
            <div className="text-center max-w-md">
                {Icon && (
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-brand-50 dark:bg-brand-500/10 rounded-full">
                            <Icon className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                        </div>
                    </div>
                )}

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {description}
                </p>

                <div className="flex flex-col gap-3">
                    {actionLink && (
                        <Link
                            to={actionLink}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:focus:ring-offset-gray-900"
                        >
                            {actionText}
                        </Link>
                    )}

                    {actionOnClick && (
                        <button
                            onClick={actionOnClick}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:focus:ring-offset-gray-900"
                        >
                            {actionText}
                        </button>
                    )}

                    {secondaryActions.map((action, index) => (
                        <Link
                            key={index}
                            to={action.link}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
                        >
                            {action.text}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

EmptyState.propTypes = {
    icon: PropTypes.elementType,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    actionText: PropTypes.string,
    actionLink: PropTypes.string,
    actionOnClick: PropTypes.func,
    secondaryActions: PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string.isRequired,
            link: PropTypes.string.isRequired,
        })
    ),
};
