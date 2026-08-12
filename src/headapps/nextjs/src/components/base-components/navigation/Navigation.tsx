"use client";
import React, { useState, JSX } from "react";
import { useRouter } from "next/router";
import { LinkField, Text, useSitecore } from "@sitecore-content-sdk/nextjs";
import { CompatibleLink } from "components/content-sdk/CompatibleLink";
import { getFieldValue } from "lib/component-props";
import {
  NavigationFields as Fields,
  NavigationListItemProps,
  NavigationProps,
} from "./navigation.props";

const getTextContent = (fields?: Fields): JSX.Element | string => {
  if (!fields) {
    return "";
  }

  const navigationTitle = getFieldValue(fields.NavigationTitle);
  const title = getFieldValue(fields.Title);

  if (navigationTitle) return <Text field={navigationTitle} />;
  if (title) return <Text field={title} />;
  return fields.DisplayName;
};

const getLinkField = (fields?: Fields): LinkField => ({
  value: {
    href: fields?.Href ?? "",
    title:
      getFieldValue(fields?.NavigationTitle)?.value?.toString() ??
      getFieldValue(fields?.Title)?.value?.toString() ??
      fields?.DisplayName,
    querystring: fields?.Querystring ?? "",
  },
});

const NavigationListItem: React.FC<NavigationListItemProps> = ({
  fields,
  handleClick,
  relativeLevel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { page } = useSitecore();
  const router = useRouter();

  if (!fields) {
    return null;
  }

  // Determine active state from current URL, not from CMS Styles (which can be stale)
  const href = fields.Href ?? "";
  const isActivePage =
    href !== "" &&
    (router.asPath === href ||
      router.asPath.split("?")[0] === href ||
      (href !== "/" && router.asPath.toLowerCase().startsWith(href.toLowerCase())));

  const classNames = [
    // Exclude any 'active' the CMS injects; we control it from the URL above
    ...fields.Styles.filter((s) => s !== "active"),
    `rel-level${relativeLevel}`,
    isActivePage ? "active" : "",
    isOpen ? "open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const hasChildren = fields.Children?.length > 0;
  const children = hasChildren
    ? fields.Children.map((fields, index) => (
        <NavigationListItem
          key={`${index}-${fields.Id}`}
          fields={fields}
          handleClick={handleClick}
          relativeLevel={relativeLevel + 1}
        />
      ))
    : null;

  return (
    <li className={classNames} key={fields.Id} tabIndex={0}>
      <div
        className={`navigation-title ${hasChildren ? "child" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CompatibleLink
          field={getLinkField(fields)}
          editable={page.mode.isEditing}
          onClick={handleClick}
        >
          {getTextContent(fields)}
        </CompatibleLink>
      </div>
      {hasChildren && <ul className="clearfix">{children}</ul>}
    </li>
  );
};

export const Default = ({ params, fields }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { page } = useSitecore();
  const { styles, RenderingIdentifier: id } = params;

  if (!fields || !Object.values(fields).length) {
    return (
      <div className={`component navigation ${styles}`} id={id}>
        <div className="component-content">[Navigation]</div>
      </div>
    );
  }

  const handleToggleMenu = (
    event?: React.MouseEvent<HTMLElement>,
    forceState?: boolean,
  ) => {
    if (event && page.mode.isEditing) {
      event.preventDefault();
    }

    setIsMenuOpen(forceState ?? !isMenuOpen);
  };

  // Sitecore often passes a single root item (e.g. Home) whose children are the real nav pages.
  // Promote those children so they render as horizontal top-level items.
  const rootItems = (Object.values(fields) as Fields[]).filter(Boolean);
  const navSource: Fields[] =
    rootItems.length === 1 && (rootItems[0].Children?.length ?? 0) > 0
      ? [{ ...rootItems[0], Children: [] }, ...rootItems[0].Children]
      : rootItems;

  const navigationItems = navSource.map((item: Fields, index) => (
    <NavigationListItem
      key={`${index}-${item.Id}`}
      fields={item}
      handleClick={(event) => handleToggleMenu(event, false)}
      relativeLevel={1}
    />
  ));

  return (
    <div className={`component navigation ${styles}`} id={id}>
      <button
        type="button"
        className="menu-toggle"
        onClick={() => handleToggleMenu()}
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        <div className="menu-humburger"><span className="mh-mid" /></div>
        <span className="sr-only">Toggle navigation</span>
      </button>

      <nav className={isMenuOpen ? "open" : ""}>
        <ul className="clearfix">{navigationItems}</ul>
      </nav>
    </div>
  );
};
